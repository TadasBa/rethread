/* ============================================================================
   POST /api/order  —  Cloudflare Pages Function

   Receives an order request, validates the submitted IDs/details, verifies
   Turnstile when configured, calculates trusted prices server-side, and emails
   Rethread plus a confirmation to the customer via Resend.
   ========================================================================== */

import { validateOrderPayload, type TrustedOrder } from "../lib/order-core";

interface Env {
  RESEND_API_KEY?: string;
  ORDER_TO_EMAIL?: string;
  ORDER_FROM_EMAIL?: string;
  TURNSTILE_SECRET_KEY?: string;
}

interface RawPayload {
  company?: string;
  turnstileToken?: string;
}

const MAX_BODY_BYTES = 30_000_000;
const PRODUCTION_HOSTS = new Set(["rethread.lt", "www.rethread.lt"]);

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

const safe = (v?: string | null): string => escapeHtml((v ?? "").trim() || "—");

async function readJson(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  const declaredLength = Number(request.headers.get("content-length") ?? "0");
  if (declaredLength > MAX_BODY_BYTES) {
    return { ok: false, response: json({ error: "request_too_large" }, 413) };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, response: json({ error: "invalid_body" }, 400) };
  }
  if (text.length > MAX_BODY_BYTES) {
    return { ok: false, response: json({ error: "request_too_large" }, 413) };
  }

  try {
    return { ok: true, body: JSON.parse(text) };
  } catch {
    return { ok: false, response: json({ error: "invalid_json" }, 400) };
  }
}

async function verifyTurnstile(request: Request, env: Env, token: unknown): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY || typeof token !== "string" || token.length === 0 || token.length > 2048) {
    return false;
  }

  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: env.TURNSTILE_SECRET_KEY,
        response: token,
        remoteip: request.headers.get("CF-Connecting-IP") ?? undefined,
        idempotency_key: crypto.randomUUID(),
      }),
    });
    const result = (await res.json()) as { success?: boolean };
    return result.success === true;
  } catch {
    return false;
  }
}

function renderAdminEmail(order: TrustedOrder): string {
  const repairBlocks = order.repairs
    .map((repair) => {
      const meta = [
        repair.location ? `vieta: ${repair.location}` : null,
        `${repair.price} €`,
      ].filter(Boolean).join(" · ");
      return (
        `<div style="margin:0 0 10px;padding:8px 12px;background:#f5f2ea;border-radius:4px">` +
        `<strong>${escapeHtml(repair.label)}</strong>` +
        ` <span style="color:#777;font-family:monospace;font-size:13px">${escapeHtml(meta)}</span>` +
        (repair.detail ? `<div style="margin-top:2px">${escapeHtml(repair.detail)}</div>` : "") +
        `</div>`
      );
    })
    .join("");

  const turn = `${order.turnaround[0]}–${order.turnaround[1]} d. d.`;

  return `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="margin:0 0 4px">Nauja taisymo užklausa</h2>
      <p style="color:#555;margin:0 0 16px">rethread.lt</p>
      <table style="border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:4px 12px 4px 0;color:#777">Vardas</td><td>${safe(order.name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">El. paštas</td><td>${safe(order.email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Telefonas</td><td>${safe(order.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Siuntimas</td><td>${safe(order.shipping)}</td></tr>
      </table>
      <h3 style="margin:0 0 4px">Drabužis</h3>
      <table style="border-collapse:collapse;margin-bottom:12px">
        <tr><td style="padding:4px 12px 4px 0;color:#777">Kategorija</td><td>${safe(order.garment.label)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Tipas / medžiaga</td><td>${safe(order.garment.type)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Spalva</td><td>${safe(order.garment.color)}</td></tr>
      </table>
      <h3 style="margin:16px 0 8px">Taisymai</h3>
      ${repairBlocks}
      <p style="font-family:monospace"><strong>Kaina:</strong> ${order.totalPrice} € &nbsp;·&nbsp; <strong>Terminas:</strong> ${turn}</p>
      <h3 style="margin:16px 0 4px">Papildoma pastaba</h3>
      <p style="white-space:pre-wrap">${safe(order.notes)}</p>
      ${order.photos.length ? `<p style="color:#777">Pridėta nuotraukų: ${order.photos.length} (žr. priedus)</p>` : ""}
    </div>`;
}

function renderCustomerEmail(order: TrustedOrder): string {
  const turn = `${order.turnaround[0]}–${order.turnaround[1]} d. d.`;
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2>Ačiū, ${safe(order.name)}!</h2>
      <p>Gavome jūsų taisymo užklausą. Per vieną darbo dieną atsiųsime patvirtinimą su apmokėjimo nuoroda ir siuntimo instrukcijomis.</p>
      <p style="font-family:monospace">Kaina: ${order.totalPrice} € · Terminas: ${turn}</p>
      <p style="color:#555">Jei turite klausimų, tiesiog atsakykite į šį laišką.</p>
      <p>— Rethread</p>
    </div>`;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;
  const parsed = await readJson(request);
  if (!parsed.ok) return parsed.response;

  const raw = parsed.body as RawPayload;

  // Honeypot: a filled "company" field means a bot. Pretend success.
  if (typeof raw.company === "string" && raw.company.trim() !== "") {
    return json({ ok: true });
  }

  const validation = validateOrderPayload(parsed.body);
  if (!validation.ok) {
    return json({ error: "validation" }, validation.status);
  }

  const host = new URL(request.url).hostname;
  const needsTurnstile = PRODUCTION_HOSTS.has(host) || Boolean(env.TURNSTILE_SECRET_KEY);
  if (needsTurnstile) {
    if (!env.TURNSTILE_SECRET_KEY) {
      console.error("[order] TURNSTILE_SECRET_KEY is missing");
      return json({ error: "temporarily_unavailable" }, 503);
    }
    const ok = await verifyTurnstile(request, env, raw.turnstileToken);
    if (!ok) return json({ error: "verification_failed" }, 403);
  }

  const order = validation.order;

  if (!env.RESEND_API_KEY) {
    console.log(`[order] dev stub: ${order.garment.id}, repairs=${order.repairs.length}, total=${order.totalPrice}`);
    return json({ ok: true, dev: true });
  }

  const from = env.ORDER_FROM_EMAIL || "Rethread <orders@rethread.lt>";
  const to = env.ORDER_TO_EMAIL || "business@rethread.lt";

  const send = (payload: Record<string, unknown>): Promise<Response> =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

  const attachments = order.photos.map((p, i) => ({
    filename: p.name || `nuotrauka-${i + 1}.jpg`,
    content: p.base64,
  }));

  try {
    const adminRes = await send({
      from,
      to,
      reply_to: order.email,
      subject: `Taisymo užklausa — ${order.name}`,
      html: renderAdminEmail(order),
      ...(attachments.length ? { attachments } : {}),
    });
    if (!adminRes.ok) {
      console.error("[order] admin email failed", adminRes.status);
      return json({ error: "email_failed" }, 502);
    }

    await send({
      from,
      to: order.email,
      subject: "Gavome jūsų taisymo užklausą — Rethread",
      html: renderCustomerEmail(order),
    }).catch(() => undefined);

    return json({ ok: true });
  } catch {
    console.error("[order] email send error");
    return json({ error: "server" }, 500);
  }
};

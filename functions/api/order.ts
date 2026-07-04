/* ============================================================================
   POST /api/order  —  Cloudflare Pages Function

   Receives an order request from the front end, validates it, blocks obvious
   bots (honeypot), and emails Rethread (plus a confirmation to the customer)
   via Resend. If RESEND_API_KEY is absent (local dev), it logs and returns OK
   so the flow is testable without secrets.

   Required environment variables (set in the Cloudflare Pages dashboard):
     RESEND_API_KEY   API key from resend.com
     ORDER_TO_EMAIL   inbox that receives order requests (e.g. business@rethread.lt)
     ORDER_FROM_EMAIL from address on a verified domain (e.g. uzsakymai@rethread.lt)
   ========================================================================== */

interface Env {
  RESEND_API_KEY?: string;
  ORDER_TO_EMAIL?: string;
  ORDER_FROM_EMAIL?: string;
}

interface RepairLine {
  label: string;
  price?: number | null;
  from?: number | null;
  detail?: string;
  location?: string | null;
}

interface Photo {
  name: string;
  type: string;
  base64: string;
}

interface OrderPayload {
  name?: string;
  email?: string;
  phone?: string;
  shipping?: string;
  notes?: string;
  company?: string; // honeypot
  garmentInfo?: { type?: string; color?: string };
  estimate?: {
    garment?: string | null;
    garmentId?: string | null;
    repairs?: RepairLine[];
    totalPrice?: number;
    totalFrom?: number;
    turnaround?: [number, number];
  };
  photos?: Photo[];
}

const json = (data: unknown, status = 200): Response =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const escapeHtml = (s: string): string =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] as string,
  );

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  let body: OrderPayload;
  try {
    body = (await request.json()) as OrderPayload;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  // Honeypot: a filled "company" field means a bot. Pretend success.
  if (body.company && body.company.trim() !== "") {
    return json({ ok: true });
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  if (!name || !emailRe.test(email)) {
    return json({ error: "validation" }, 422);
  }

  const est = body.estimate ?? {};
  const repairs = Array.isArray(est.repairs) ? est.repairs : [];
  const gi = body.garmentInfo ?? {};
  const safe = (v?: string | null): string => escapeHtml((v ?? "").trim() || "—");

  const repairBlocks = repairs
    .map((r) => {
      const price = r.price ?? r.from;
      const meta = [r.location ? `vieta: ${r.location}` : null, price != null ? `${price} €` : null]
        .filter(Boolean)
        .join(" · ");
      return (
        `<div style="margin:0 0 10px;padding:8px 12px;background:#f5f2ea;border-radius:4px">` +
        `<strong>${escapeHtml(r.label)}</strong>` +
        (meta ? ` <span style="color:#777;font-family:monospace;font-size:13px">${escapeHtml(meta)}</span>` : "") +
        (r.detail ? `<div style="margin-top:2px">${escapeHtml(r.detail)}</div>` : "") +
        `</div>`
      );
    })
    .join("");

  const turn = est.turnaround ? `${est.turnaround[0]}–${est.turnaround[1]} d. d.` : "—";
  const total = est.totalPrice ?? est.totalFrom ?? 0;

  const adminHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:600px">
      <h2 style="margin:0 0 4px">Nauja taisymo užklausa</h2>
      <p style="color:#555;margin:0 0 16px">rethread.lt</p>
      <table style="border-collapse:collapse;margin-bottom:16px">
        <tr><td style="padding:4px 12px 4px 0;color:#777">Vardas</td><td>${safe(name)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">El. paštas</td><td>${safe(email)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Telefonas</td><td>${safe(body.phone)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Siuntimas</td><td>${safe(body.shipping)}</td></tr>
      </table>
      <h3 style="margin:0 0 4px">Drabužis</h3>
      <table style="border-collapse:collapse;margin-bottom:12px">
        <tr><td style="padding:4px 12px 4px 0;color:#777">Kategorija</td><td>${safe(est.garment)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Tipas / medžiaga</td><td>${safe(gi.type)}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#777">Spalva</td><td>${safe(gi.color)}</td></tr>
      </table>
      <h3 style="margin:16px 0 8px">Taisymai</h3>
      ${repairBlocks || "<p>—</p>"}
      <p style="font-family:monospace"><strong>Kaina:</strong> ${total} € &nbsp;·&nbsp; <strong>Terminas:</strong> ${turn}</p>
      <h3 style="margin:16px 0 4px">Papildoma pastaba</h3>
      <p style="white-space:pre-wrap">${safe(body.notes)}</p>
      ${Array.isArray(body.photos) && body.photos.length ? `<p style="color:#777">Pridėta nuotraukų: ${body.photos.length} (žr. priedus)</p>` : ""}
    </div>`;

  const customerHtml = `
    <div style="font-family:system-ui,sans-serif;max-width:560px">
      <h2>Ačiū, ${safe(name)}!</h2>
      <p>Gavome jūsų taisymo užklausą. Per vieną darbo dieną atsiųsime patvirtinimą su siuntimo ir apmokėjimo instrukcijomis.</p>
      <p style="font-family:monospace">Kaina: ${total} € · Terminas: ${turn}</p>
      <p style="color:#555">Jei turite klausimų, tiesiog atsakykite į šį laišką.</p>
      <p>— Rethread</p>
    </div>`;

  // Local/dev stub: no key → log and succeed so the flow is testable.
  if (!env.RESEND_API_KEY) {
    console.log("[order] (dev stub, no RESEND_API_KEY) new request:", JSON.stringify(body));
    return json({ ok: true, dev: true });
  }

  const from = env.ORDER_FROM_EMAIL || "Rethread <uzsakymai@rethread.lt>";
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

  // Photos → email attachments (Resend expects base64 in `content`).
  const attachments = (Array.isArray(body.photos) ? body.photos : [])
    .slice(0, 5)
    .filter((p) => p && typeof p.base64 === "string" && p.base64.length < 6_000_000)
    .map((p, i) => ({ filename: p.name || `nuotrauka-${i + 1}.jpg`, content: p.base64 }));

  try {
    const adminRes = await send({
      from,
      to,
      reply_to: email,
      subject: `Taisymo užklausa — ${name}`,
      html: adminHtml,
      ...(attachments.length ? { attachments } : {}),
    });
    if (!adminRes.ok) {
      console.error("[order] admin email failed", adminRes.status, await adminRes.text());
      return json({ error: "email_failed" }, 502);
    }
    // Confirmation to the customer (best effort — don't fail the request on it).
    context && (await send({
      from,
      to: email,
      subject: "Gavome jūsų taisymo užklausą — Rethread",
      html: customerHtml,
    }).catch(() => undefined));

    return json({ ok: true });
  } catch (err) {
    console.error("[order] error", err);
    return json({ error: "server" }, 500);
  }
};

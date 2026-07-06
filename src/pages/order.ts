/* ============================================================================
   Užsakymo užklausa — order request, prefilled from the estimator store.
   Collects what the sewer actually needs: garment type + colour, a specific
   note per repair (from each repair's `ask`), the marked location, and photos.
   Posts to the Cloudflare Function /api/order (photos as email attachments).
   No payment here — Rethread confirms shipping/payment instructions by email.
   ========================================================================== */

import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import { pageHead } from "./_helpers";
import { estimate } from "../lib/store";
import type { Spot } from "../lib/store";
import {
  garmentById,
  repairById,
  priceOf,
  totalPrice,
  turnaroundFor,
  fmtEur,
  type RepairId,
} from "../content/pricing";

interface Photo {
  name: string;
  type: string;
  base64: string;
}

const MAX_PHOTOS = 5;
const MAX_BYTES = 4 * 1024 * 1024;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;

declare global {
  interface Window {
    turnstile?: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement | string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

let turnstileScript: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScript) return turnstileScript;

  turnstileScript = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>("script[data-turnstile]");
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("turnstile_load_failed")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstile = "true";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile_load_failed"));
    document.head.appendChild(script);
  });

  return turnstileScript;
}

function describeSpot(s: Spot): string {
  const vert = s.y < 0.4 ? "viršus" : s.y > 0.66 ? "apačia" : "vidurys";
  const horiz = s.x < 0.4 ? "kairė" : s.x > 0.66 ? "dešinė" : "centras";
  return `${vert} · ${horiz}`;
}

function summary(): HTMLElement {
  const { garment, repairs, spots } = estimate.get();
  if (!garment || repairs.length === 0) {
    return h("div.ordersum.ordersum--empty", {},
      h("p", {}, S.order.emptySummary),
      h("a.btn.btn--ghost", { href: "/taisymas" }, S.order.toEstimator),
    );
  }
  const [lo, hi] = turnaroundFor(repairs);
  return h(
    "div.ordersum",
    {},
    h("div.ordersum__head", {},
      h("span.ordersum__label.spec", {}, S.estimator.liveGarment),
      h("span.ordersum__garment", {}, garmentById(garment).label),
    ),
    h("ul.ordersum__list", {},
      ...repairs.map((rid) =>
        h("li.ordersum__line", {},
          h("span", {}, repairById(rid).label, spots[rid] ? h("span.ordersum__spot", {}, ` · ${describeSpot(spots[rid] as Spot)}`) : null),
          h("span.num", {}, fmtEur(priceOf(rid, garment) ?? 0)),
        ),
      ),
    ),
    h("div.ordersum__totals", {},
      h("div", {},
        h("span.ordersum__t-label.spec", {}, S.common.estimate),
        h("span.ordersum__t-value.num", {}, fmtEur(totalPrice(garment, repairs))),
      ),
      h("div.ordersum__eta", {},
        h("span.ordersum__t-label.spec", {}, S.common.turnaround),
        h("span.ordersum__t-value.num", {}, `${lo}–${hi} ${S.common.days}`),
      ),
    ),
    h("a.link-stitch.ordersum__edit", { href: "/taisymas" }, S.order.toEstimator),
  );
}

function textField(opts: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autocomplete?: string;
  placeholder?: string;
}): { wrap: HTMLElement; input: HTMLInputElement; error: HTMLElement } {
  const error = h("span.field__error", { id: `err-${opts.name}`, "aria-live": "polite" });
  const input = h("input.field__input", {
    type: opts.type ?? "text",
    name: opts.name,
    id: `f-${opts.name}`,
    required: opts.required,
    autocomplete: opts.autocomplete,
    placeholder: opts.placeholder,
    "aria-describedby": `err-${opts.name}`,
  }) as HTMLInputElement;
  const wrap = h("label.field", { for: `f-${opts.name}` },
    h("span.field__label", {}, opts.label,
      opts.required
        ? h("span.field__req.spec", {}, ` ${S.common.required}`)
        : h("span.field__opt.spec", {}, ` ${S.common.optional}`)),
    input,
    error,
  );
  return { wrap, input, error };
}

function fieldset(title: string, ...children: (Node | false | null)[]): HTMLElement {
  return h("fieldset.formsec", {},
    h("legend.formsec__legend.spec", {}, title),
    ...children.filter(Boolean) as Node[],
  );
}

function readFile(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const str = String(reader.result);
      resolve({ name: file.name, type: file.type, base64: str.slice(str.indexOf(",") + 1) });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function renderOrder(): HTMLElement {
  const { garment, repairs, spots } = estimate.get();
  const hasSelection = garment != null && repairs.length > 0;

  const name = textField({ name: "name", label: S.order.fields.name, required: true, autocomplete: "name" });
  const email = textField({ name: "email", label: S.order.fields.email, type: "email", required: true, autocomplete: "email" });
  const phone = textField({ name: "phone", label: S.order.fields.phone, type: "tel", autocomplete: "tel" });
  const gType = textField({ name: "gtype", label: S.order.fields.garmentType, placeholder: S.order.fields.garmentTypePlaceholder });
  const gColor = textField({ name: "gcolor", label: S.order.fields.color, placeholder: S.order.fields.colorPlaceholder });

  // Per-repair detail inputs, prompted by each repair's `ask`.
  const detailInputs = new Map<RepairId, HTMLInputElement>();
  const repairFields = repairs.map((rid) => {
    const r = repairById(rid);
    const input = h("input.field__input", {
      type: "text",
      name: `detail-${rid}`,
      id: `f-detail-${rid}`,
      placeholder: r.ask,
    }) as HTMLInputElement;
    detailInputs.set(rid, input);
    return h("label.field", { for: `f-detail-${rid}` },
      h("span.field__label", {}, r.label,
        spots[rid] ? h("span.field__loc.spec", {}, ` · ${S.order.locationLabel}: ${describeSpot(spots[rid] as Spot)}`) : null),
      input,
    );
  });

  const shipping = h("select.field__input", { name: "shipping", id: "f-shipping" },
    ...S.order.fields.shippingOptions.map((o) => h("option", { value: o }, o)),
  ) as HTMLSelectElement;
  const shippingWrap = h("label.field", { for: "f-shipping" },
    h("span.field__label", {}, S.order.fields.shipping),
    shipping,
  );

  const notes = h("textarea.field__input.field__textarea", {
    name: "notes", id: "f-notes", rows: "2", placeholder: S.order.fields.notesPlaceholder,
  }) as HTMLTextAreaElement;
  const notesWrap = h("label.field", { for: "f-notes" },
    h("span.field__label", {}, S.order.fields.notes,
      h("span.field__opt.spec", {}, ` ${S.common.optional}`)),
    notes,
  );

  // Photos ------------------------------------------------------------------
  const photos: Photo[] = [];
  const photoList = h("ul.photos__list");
  const photoInput = h("input", {
    type: "file", id: "f-photos", accept: "image/*", multiple: true, class: "photos__input visually-hidden",
  }) as HTMLInputElement;
  const photoErr = h("span.field__error", { "aria-live": "polite" });

  const renderPhotos = (): void => {
    photoList.replaceChildren(
      ...photos.map((p, i) =>
        h("li.photos__item", {},
          h("span.photos__name", {}, p.name),
          h("button.photos__rm", {
            type: "button", "aria-label": `${S.estimator.remove}: ${p.name}`,
            onclick: () => { photos.splice(i, 1); renderPhotos(); },
          }, "✕"),
        ),
      ),
    );
  };

  photoInput.addEventListener("change", async () => {
    photoErr.textContent = "";
    const files = Array.from(photoInput.files ?? []);
    for (const file of files) {
      if (photos.length >= MAX_PHOTOS) { photoErr.textContent = S.order.photoTooMany; break; }
      if (file.size > MAX_BYTES) { photoErr.textContent = S.order.photoTooBig; continue; }
      photos.push(await readFile(file));
    }
    photoInput.value = "";
    renderPhotos();
  });

  const photoField = h("div.photos", {},
    h("label.btn.btn--ghost.photos__btn", {}, S.order.photosAdd, photoInput),
    h("p.photos__hint", {}, S.order.photosHint),
    photoList,
    photoErr,
  );

  // Consent -----------------------------------------------------------------
  const consent = h("input", { type: "checkbox", name: "consent", id: "f-consent" }) as HTMLInputElement;
  const consentErr = h("span.field__error", { "aria-live": "polite" });
  const consentWrap = h("div.field.field--check", {},
    h("label.check", { for: "f-consent" }, consent, h("span", {}, S.order.fields.consent)),
    consentErr,
  );

  const honeypot = h("input.hp", {
    type: "text", name: "company", tabindex: "-1", autocomplete: "off", "aria-hidden": "true",
  }) as HTMLInputElement;

  let turnstileToken = "";
  let turnstileWidgetId: string | null = null;
  const turnstileBox = h("div.turnstile-box");
  const turnstileErr = h("span.field__error", { "aria-live": "polite" });

  const mountTurnstile = (): void => {
    if (!TURNSTILE_SITE_KEY || turnstileWidgetId || !turnstileBox.isConnected) return;
    loadTurnstile()
      .then(() => {
        window.turnstile?.ready(() => {
          if (!window.turnstile || turnstileWidgetId || !turnstileBox.isConnected) return;
          turnstileWidgetId = window.turnstile.render(turnstileBox, {
            sitekey: TURNSTILE_SITE_KEY,
            theme: "light",
            callback: (token: string) => {
              turnstileToken = token;
              turnstileErr.textContent = "";
            },
            "expired-callback": () => {
              turnstileToken = "";
            },
            "error-callback": () => {
              turnstileToken = "";
            },
          });
        });
      })
      .catch(() => {
        turnstileErr.textContent = S.order.validation.verification;
      });
  };

  const submitBtn = h("button.btn.btn--accent.orderform__submit", { type: "submit" }, S.order.submit) as HTMLButtonElement;
  const formStatus = h("p.orderform__status", { role: "status", "aria-live": "polite" });

  const form = h(
    "form.orderform",
    {
      novalidate: true,
      onsubmit: async (e: SubmitEvent) => {
        e.preventDefault();
        let ok = true;
        const setErr = (f: { error: HTMLElement; input: HTMLInputElement }, msg: string) => {
          f.error.textContent = msg;
          f.input.setAttribute("aria-invalid", "true");
          f.input.classList.add("is-invalid");
          ok = false;
        };
        const clearErr = (f: { error: HTMLElement; input: HTMLInputElement }) => {
          f.error.textContent = "";
          f.input.removeAttribute("aria-invalid");
          f.input.classList.remove("is-invalid");
        };
        clearErr(name); clearErr(email);
        if (!name.input.value.trim()) setErr(name, S.order.validation.name);
        if (!emailRe.test(email.input.value.trim())) setErr(email, S.order.validation.email);
        consentErr.textContent = "";
        if (!consent.checked) { consentErr.textContent = S.order.validation.consent; ok = false; }
        turnstileErr.textContent = "";
        if (TURNSTILE_SITE_KEY && !turnstileToken) {
          turnstileErr.textContent = S.order.validation.verification;
          ok = false;
        }
        if (!ok) {
          form.querySelector<HTMLElement>(".is-invalid")?.focus();
          return;
        }
        if (!garment || repairs.length === 0) return;

        submitBtn.disabled = true;
        formStatus.classList.remove("is-error");
        formStatus.textContent = S.order.submitting;

        const repairDetails: Partial<Record<RepairId, string>> = {};
        const repairLocations: Partial<Record<RepairId, string>> = {};
        for (const rid of repairs) {
          repairDetails[rid] = detailInputs.get(rid)?.value.trim() || "";
          if (spots[rid]) repairLocations[rid] = describeSpot(spots[rid] as Spot);
        }

        const payload = {
          name: name.input.value.trim(),
          email: email.input.value.trim(),
          phone: phone.input.value.trim(),
          shipping: shipping.value,
          notes: notes.value.trim(),
          consent: consent.checked,
          company: honeypot.value,
          garmentInfo: { type: gType.input.value.trim(), color: gColor.input.value.trim() },
          garmentId: garment,
          repairIds: repairs,
          repairDetails,
          repairLocations,
          photos: photos.map((p) => ({ name: p.name, type: p.type, base64: p.base64 })),
          turnstileToken,
        };

        try {
          const res = await fetch("/api/order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          if (!res.ok) throw new Error(String(res.status));
          estimate.reset();
          showSuccess(root);
        } catch {
          submitBtn.disabled = false;
          formStatus.textContent = `${S.order.errorTitle} ${S.order.errorBody}`;
          formStatus.classList.add("is-error");
          if (turnstileWidgetId) {
            window.turnstile?.reset(turnstileWidgetId);
            turnstileToken = "";
          }
        }
      },
    },
    fieldset(S.order.contactTitle,
      h("div.orderform__row", {}, name.wrap, email.wrap),
      phone.wrap,
    ),
    fieldset(S.order.garmentTitle,
      h("div.orderform__row", {}, gType.wrap, gColor.wrap),
    ),
    repairFields.length
      ? fieldset(S.order.repairsTitle,
          h("p.formsec__hint", {}, S.order.repairsHint),
          ...repairFields,
        )
      : null,
    fieldset(S.order.photosTitle, photoField),
    fieldset(S.order.shippingTitle, shippingWrap, notesWrap),
    TURNSTILE_SITE_KEY
      ? h("div.formsec", {}, turnstileBox, turnstileErr)
      : null,
    consentWrap,
    honeypot,
    h("div.orderform__foot", {}, submitBtn, formStatus),
  );

  const root = h(
    "div.page.page-order",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell", {},
        h("a.backlink.link-stitch", { href: "/taisymas" }, "← ", S.order.back),
        pageHead({ title: S.order.title, lead: S.order.lead }),
        h("div.order__grid", {},
          h(
            "div.order__form-col",
            {},
            hasSelection
              ? form
              : h("div.ordersum.ordersum--empty.order__empty", {},
                  h("p", {}, S.order.emptySummary),
                  h("a.btn.btn--ghost", { href: "/taisymas" }, S.order.toEstimator),
                ),
          ),
          h("aside.order__sum-col", {},
            h("h2.order__sum-title", {}, S.order.summaryTitle),
            summary(),
          ),
        ),
      ),
    ),
  );

  if (hasSelection && TURNSTILE_SITE_KEY) requestAnimationFrame(mountTurnstile);

  return root;
}

function showSuccess(root: HTMLElement): void {
  const section = root.querySelector(".panel .shell");
  if (!section) return;
  section.replaceChildren(
    h("div.order-success", { "data-autofocus": true, tabindex: "-1" },
      h("div.order-success__mark", { "aria-hidden": "true" }, "✓"),
      h("h1.d3", {}, S.order.successTitle),
      h("p.measure", {}, S.order.successBody),
      h("a.btn.btn--accent", { href: "/" }, S.order.successCta),
    ),
  );
  (section.querySelector(".order-success") as HTMLElement)?.focus();
}

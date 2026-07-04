/* ============================================================================
   Footer — a deep-indigo "hem" that closes the page. Newsletter (stubbed),
   navigation, legal. The newsletter posts nowhere yet; it just confirms.
   ========================================================================== */

import { h } from "../lib/dom";
import { S } from "../i18n/strings";

export function buildFooter(): HTMLElement {
  const year = new Date().getFullYear();

  const input = h("input.news__input", {
    type: "email",
    name: "email",
    required: true,
    placeholder: S.footer.newsletterPlaceholder,
    "aria-label": S.footer.newsletterPlaceholder,
    autocomplete: "email",
  }) as HTMLInputElement;

  const status = h("p.news__status", { role: "status", "aria-live": "polite" });

  const form = h(
    "form.news__form",
    {
      novalidate: true,
      onsubmit: (e: SubmitEvent) => {
        e.preventDefault();
        if (!input.checkValidity()) {
          input.reportValidity();
          return;
        }
        (form as HTMLFormElement).reset();
        status.textContent = S.footer.newsletterDone;
      },
    },
    input,
    h("button.btn.btn--ghost.news__btn", { type: "submit" }, S.footer.newsletterCta),
  ) as HTMLFormElement;

  return h(
    "footer.footer.on-indigo",
    {},
    h("div.footer__seam", { "aria-hidden": "true" }),
    h(
      "div.footer__inner.shell",
      {},
      h(
        "div.footer__brand",
        {},
        h("p.footer__mark", {}, "rethread"),
        h("p.footer__tag", {}, S.footer.tagline),
        h(
          "div.footer__news",
          {},
          h("p.footer__news-title", {}, S.footer.newsletterTitle),
          h("p.footer__news-body", {}, S.footer.newsletterBody),
          form,
          status,
        ),
      ),
      h(
        "nav.footer__col",
        { "aria-label": S.footer.nav },
        h("p.footer__h", {}, S.footer.nav),
        h("a.footer__link", { href: "/kaip-veikia" }, S.nav.how),
        h("a.footer__link", { href: "/taisymas" }, S.nav.estimator),
        h("a.footer__link", { href: "/zurnalas" }, S.nav.journal),
        h("a.footer__link", { href: "/duk" }, S.nav.faq),
        h("a.footer__link", { href: "/apie" }, S.nav.about),
        h("a.footer__link", { href: "/kontaktai" }, S.nav.contact),
      ),
      h(
        "div.footer__col",
        {},
        h("p.footer__h", {}, S.footer.legal),
        h("a.footer__link", { href: "/kontaktai" }, S.contact.email),
        h("a.footer__link", { href: "/privatumas" }, S.footer.privacy),
        h("a.footer__link", { href: "/salygos" }, S.footer.terms),
        h("a.footer__link", { href: "/siuntimas" }, S.footer.shipping),
      ),
    ),
    h(
      "div.footer__base.shell",
      {},
      h("p.footer__fine", {}, `© ${year} Rethread. ${S.footer.rights}.`),
      h("p.footer__fine", {}, `${S.footer.madeIn} · Vilnius`),
    ),
  );
}

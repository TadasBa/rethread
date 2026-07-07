/* ============================================================================
   Top navigation — persistent chrome. Wordmark, stitched link row, primary CTA.
   Mobile: a full "cloth panel" overlay. Active route is tracked via the
   router's onRouteChange callback (see main.ts).
   ========================================================================== */

import { h } from "../lib/dom";
import { wordmark } from "./wordmark";
import { S } from "../i18n/strings";

const LINKS: Array<{ href: string; label: string }> = [
  { href: "/kaip-tai-veikia", label: S.nav.how },
  { href: "/taisymas", label: S.nav.estimator },
  { href: "/zurnalas", label: S.nav.journal },
  { href: "/duk", label: S.nav.faq },
  { href: "/apie", label: S.nav.about },
  { href: "/kontaktai", label: S.nav.contact },
];

export function buildNav(): HTMLElement {
  const linkEls = LINKS.map((l) =>
    h("a.nav__link", { href: l.href, "data-path": l.href }, l.label),
  );

  const overlayLinks = LINKS.map((l) =>
    h("a.navmenu__link", { href: l.href, "data-path": l.href }, l.label),
  );

  const cta = h("a.btn.btn--accent.nav__cta", { href: "/taisymas" }, S.nav.start);

  const overlay = h(
    "div.navmenu",
    { id: "navmenu", role: "dialog", "aria-modal": "true", "aria-label": S.nav.menu, hidden: true },
    h("div.navmenu__panel", {},
      h("nav.navmenu__links", { "aria-label": S.nav.menu }, ...overlayLinks),
      h("a.btn.btn--accent.navmenu__cta", { href: "/taisymas" }, S.nav.start),
    ),
  );

  const toggle = h(
    "button.nav__toggle",
    {
      type: "button",
      "aria-expanded": "false",
      "aria-controls": "navmenu",
      "aria-label": S.nav.menu,
    },
    h("span.nav__toggle-bars", { "aria-hidden": "true" }),
  );

  const setOpen = (open: boolean): void => {
    overlay.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? S.nav.close : S.nav.menu);
    document.body.classList.toggle("is-menu-open", open);
    if (open) {
      overlay.querySelector<HTMLElement>(".navmenu__link")?.focus();
    } else {
      toggle.focus();
    }
  };

  toggle.addEventListener("click", () => setOpen(overlay.hidden));
  overlay.addEventListener("click", (e) => {
    const target = e.target as Element;
    if (target === overlay || target.closest("a")) setOpen(false);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !overlay.hidden) setOpen(false);
  });

  const bar = h(
    "div.nav__inner.shell",
    {},
    wordmark(),
    h("nav.nav__links", { "aria-label": "Pagrindinis meniu" }, ...linkEls),
    h("div.nav__right", {}, cta, toggle),
  );

  const header = h(
    "header.nav",
    {},
    bar,
    h("div.nav__seam", { "aria-hidden": "true" }),
  );

  // The overlay must NOT live inside .nav — the header's backdrop-filter would
  // become the containing block for its position:fixed and trap it. Mount it on
  // the body so it covers the viewport.
  document.body.appendChild(overlay);

  return header;
}

/** Highlight the current route in both the bar and overlay. */
export function setActiveNav(path: string): void {
  document.querySelectorAll<HTMLElement>("[data-path]").forEach((el) => {
    const p = el.dataset.path || "";
    const active = p === path || (p !== "/" && path.startsWith(p));
    el.classList.toggle("is-active", active);
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
}

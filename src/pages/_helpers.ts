/* Shared building blocks for pages. */
import { h } from "../lib/dom";

/** A titled section header (eyebrow + title + optional lead). */
export function sectionHead(opts: {
  eyebrow?: string;
  title: string;
  lead?: string;
  wide?: boolean;
}): HTMLElement {
  return h(
    `div.section-head${opts.wide ? ".section-head--wide" : ""}`,
    { "data-reveal": true },
    opts.eyebrow && h("span.eyebrow", {}, opts.eyebrow),
    h("h2.section-head__title", {}, opts.title),
    opts.lead && h("p.section-head__lead", {}, opts.lead),
  );
}

/** A standard content page header (h1). */
export function pageHead(opts: { eyebrow?: string; title: string; lead?: string }): HTMLElement {
  return h(
    "header.pagehead",
    {},
    opts.eyebrow && h("span.eyebrow", {}, opts.eyebrow),
    h("h1.pagehead__title.d2", { "data-autofocus": true }, opts.title),
    opts.lead && h("p.pagehead__lead.measure", {}, opts.lead),
  );
}

export const seam = (variant: "onlight" | "ondark" | "accent" = "onlight"): HTMLElement =>
  h(`div.seam.seam--${variant}`, { "aria-hidden": "true" });

/** Arrow glyph used in buttons/links. */
export const arrow = (): HTMLElement =>
  h("span.btn-arrow", { "aria-hidden": "true" }, "→");

/* ============================================================================
   Home — the thesis. Hero shows a tear being sewn shut (the whole business in
   one gesture), then the three stitches, proof of craft, the manifesto, CTA.
   ========================================================================== */

import { h, s } from "../lib/dom";
import { S } from "../i18n/strings";
import { sectionHead, seam } from "./_helpers";

function heroScene(): SVGElement {
  // A torn panel of cloth, sewn shut by a running stitch that draws on load.
  return s(
    "svg.hero-scene",
    { viewBox: "0 0 420 420", role: "img", "aria-label": "Plyšys, susiuvamas dygsniu" },
    // cloth swatch
    s("rect.hero-cloth", { x: "70", y: "70", width: "280", height: "280", rx: "6" }),
    // frayed tear (two lips of a rip)
    s("path.hero-tear", { d: "M210,96 C202,150 224,190 206,232 C226,276 198,314 212,344", fill: "none" }),
    // the running stitch closing the tear
    s("path.hero-stitch", {
      d: "M176,120 L244,120 M176,150 L244,150 M176,180 L244,180 M176,210 L244,210 M176,240 L244,240 M176,270 L244,270 M176,300 L244,300",
      fill: "none",
    }),
    // needle
    s("g.hero-needle", {},
      s("line", { x1: "250", y1: "300", x2: "300", y2: "250", "stroke-width": "3" }),
      s("circle", { cx: "302", cy: "248", r: "4" }),
    ),
  );
}

export function renderHome(): HTMLElement {
  const hero = h(
    "section.hero.panel--raw",
    {},
    h(
      "div.hero__inner.shell",
      {},
      h(
        "div.hero__copy",
        {},
        h("span.eyebrow", { "data-reveal": true }, S.hero.eyebrow),
        h(
          "h1.hero__title.d1",
          { "data-autofocus": true, "data-reveal": true },
          h("span.hero__title-a", {}, S.hero.titleA),
          " ",
          h("span.hero__title-b", {}, S.hero.titleB),
        ),
        h("p.hero__lead.measure", { "data-reveal": true }, S.hero.lead),
        h(
          "div.hero__actions",
          { "data-reveal": true },
          h("a.btn.btn--accent", { href: "/taisymas" }, S.hero.ctaPrimary),
          h("a.btn.btn--ghost", { href: "/kaip-tai-veikia" }, S.hero.ctaSecondary),
        ),
      ),
      h(
        "div.hero__visual",
        { "data-reveal": true },
        heroScene(),
        h("div.hero__stats", {},
          stat(S.hero.stat1Value, S.hero.stat1Label),
          stat(S.hero.stat3Value, S.hero.stat3Label),
          stat(S.hero.stat2Value, S.hero.stat2Label),
        ),
      ),
    ),
  );

  // Three stitches (process) — woven on a vertical thread with knots.
  const steps = h(
    "section.panel.panel--raw-2.steps",
    { id: "steps" },
    h(
      "div.shell",
      {},
      sectionHead({ eyebrow: S.steps.eyebrow, title: S.steps.title, lead: S.steps.lead }),
      h(
        "ol.steps__list",
        {},
        ...S.steps.items.map((step) =>
          h(
            "li.step",
            { "data-reveal": true },
            h("div.step__knot", { "aria-hidden": "true" }),
            h("span.step__code.num", {}, step.code),
            h("h3.step__title", {}, step.title),
            h("p.step__body", {}, step.body),
          ),
        ),
      ),
    ),
  );

  // Proof of craft
  const proof = h(
    "section.panel.panel--raw.proof",
    {},
    h(
      "div.shell",
      {},
      sectionHead({ eyebrow: S.proof.eyebrow, title: S.proof.title, lead: S.proof.lead, wide: true }),
      h(
        "div.proof__grid",
        {},
        ...S.proof.cards.map((c) =>
          h(
            "article.proof__card",
            { "data-reveal": true },
            h("h3.proof__k", {}, c.k),
            h("p.proof__v", {}, c.v),
          ),
        ),
      ),
      h("p.proof__note", { "data-reveal": true },
        h("span.spec", {}, "PS "), S.proof.note),
    ),
  );

  // Manifesto — indigo, the emotional core
  const manifesto = h(
    "section.panel.panel--indigo.manifesto.on-indigo",
    {},
    h(
      "div.shell.manifesto__inner",
      {},
      h("div.manifesto__main", {},
        h("span.eyebrow", { "data-reveal": true }, S.manifesto.eyebrow),
        h("h2.manifesto__title.d2", { "data-reveal": true }, S.manifesto.title),
        h("p.manifesto__body.measure", { "data-reveal": true }, S.manifesto.body),
      ),
      h("aside.manifesto__figure", { "data-reveal": true },
        h("p.manifesto__figure-text", {}, S.manifesto.figure),
      ),
    ),
  );

  // Final CTA
  const cta = h(
    "section.panel.panel--raw-2.homecta",
    {},
    h("div.shell.homecta__inner", { "data-reveal": true },
      h("div", {},
        h("h2.homecta__title.d3", {}, S.homeCta.title),
        h("p.homecta__body", {}, S.homeCta.body),
      ),
      h("a.btn.btn--accent.homecta__btn", { href: "/taisymas" }, S.homeCta.button),
    ),
  );

  return h(
    "div.page.page-home",
    {},
    hero,
    seam("onlight"),
    steps,
    proof,
    manifesto,
    cta,
  );
}

function stat(value: string, label: string): HTMLElement {
  return h("div.stat", {},
    h("span.stat__value.num", {}, value),
    h("span.stat__label.spec", {}, label),
  );
}

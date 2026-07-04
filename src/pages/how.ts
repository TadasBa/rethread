/* Kaip veikia — the full journey, laid out as a stitched vertical timeline. */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import { pageHead, seam } from "./_helpers";

export function renderHow(): HTMLElement {
  const timeline = h(
    "ol.how__list",
    {},
    ...S.how.sections.map((sec) =>
      h(
        "li.how__step",
        { "data-reveal": true },
        h("div.how__knot", { "aria-hidden": "true" }),
        h("span.how__code.num", {}, sec.code),
        h("div.how__content", {},
          h("h2.how__title", {}, sec.title),
          h("p.how__body.measure", {}, sec.body),
        ),
      ),
    ),
  );

  const cards = h(
    "div.how__cards",
    {},
    h("article.infocard", { "data-reveal": true },
      h("h3.infocard__title", {}, S.how.shippingTitle),
      h("p", {}, S.how.shippingBody),
    ),
    h("article.infocard.infocard--accent", { "data-reveal": true },
      h("h3.infocard__title", {}, S.how.guaranteeTitle),
      h("p", {}, S.how.guaranteeBody),
    ),
  );

  return h(
    "div.page",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell", {},
        pageHead({ title: S.how.title, lead: S.how.lead }),
        timeline,
        cards,
        h("div.how__cta", { "data-reveal": true },
          h("a.btn.btn--accent", { href: "/taisymas" }, S.hero.ctaPrimary),
        ),
      ),
    ),
    seam("onlight"),
  );
}

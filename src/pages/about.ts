/* Apie mus */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import { pageHead } from "./_helpers";

export function renderAbout(): HTMLElement {
  return h(
    "div.page",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell", {},
        pageHead({ title: S.about.title, lead: S.about.lead }),
        h("div.about__body", { "data-reveal": true },
          h("p", {}, S.about.body1),
          h("p", {}, S.about.body2),
          h("p", {}, S.about.body3),
        ),
      ),
    ),
    h("section.panel.panel--indigo.on-indigo", {},
      h("div.shell", {},
        h("span.eyebrow", { "data-reveal": true }, S.about.valuesTitle),
        h("div.values__grid", {},
          ...S.about.values.map((v) =>
            h("article.value", { "data-reveal": true },
              h("div.value__knot", { "aria-hidden": "true" }),
              h("h3.value__k", {}, v.k),
              h("p.value__v", {}, v.v),
            ),
          ),
        ),
        h("div.about__cta", { "data-reveal": true },
          h("a.btn.btn--accent", { href: "/taisymas" }, S.hero.ctaPrimary),
        ),
      ),
    ),
  );
}

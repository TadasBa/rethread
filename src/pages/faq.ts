/* DUK — accordion. Native <details> for zero-JS accessibility. */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import { pageHead } from "./_helpers";

export function renderFaq(): HTMLElement {
  const items = S.faq.items.map((item, i) =>
    h(
      "details.faq__item",
      { "data-reveal": true, name: "faq", open: i === 0 },
      h("summary.faq__q", {},
        h("span.faq__q-text", {}, item.q),
        h("span.faq__mark", { "aria-hidden": "true" }),
      ),
      h("div.faq__a", {}, h("p", {}, item.a)),
    ),
  );

  return h(
    "div.page",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell-narrow", {},
        pageHead({ title: S.faq.title, lead: S.faq.lead }),
        h("div.faq__list", {}, ...items),
        h("div.faq__cta", { "data-reveal": true },
          h("a.btn.btn--ghost", { href: "/kontaktai" }, S.nav.contact),
        ),
      ),
    ),
  );
}

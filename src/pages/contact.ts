/* Kontaktai */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import { pageHead } from "./_helpers";

export function renderContact(): HTMLElement {
  return h(
    "div.page",
    {},
    h("section.panel.panel--raw", {},
      h("div.shell", {},
        pageHead({ title: S.contact.title, lead: S.contact.lead }),
        h("div.contact__grid", {},
          h("div.contact__rows", { "data-reveal": true },
            row(S.contact.emailLabel, h("a.link-stitch", { href: `mailto:${S.contact.email}` }, S.contact.email)),
            row(S.contact.hoursLabel, h("span", {}, S.contact.hours)),
            row(S.contact.socialLabel,
              h("span.contact__social", {},
                h("a.link-stitch", { href: "https://instagram.com/rethread.lt", rel: "external", target: "_blank" }, "Instagram"),
                h("a.link-stitch", { href: "https://facebook.com/rethread.lt", rel: "external", target: "_blank" }, "Facebook"),
              ),
            ),
          ),
          h("aside.contact__photo", { "data-reveal": true },
            h("h2.contact__photo-title", {}, S.contact.photoTitle),
            h("p", {}, S.contact.photoBody),
            h("a.btn.btn--accent", { href: `mailto:${S.contact.email}` }, S.contact.email),
          ),
        ),
      ),
    ),
  );
}

function row(label: string, value: HTMLElement): HTMLElement {
  return h("div.contact__row", {},
    h("span.contact__label.spec", {}, label),
    h("div.contact__value", {}, value),
  );
}

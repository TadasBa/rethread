import { h } from "../lib/dom";
import { S } from "../i18n/strings";

export function renderNotFound(): HTMLElement {
  return h(
    "div.page.panel.panel--raw.notfound",
    {},
    h("div.shell.notfound__inner", {},
      h("span.notfound__code.num", {}, "404"),
      h("h1.d2", { "data-autofocus": true }, S.common.notFoundTitle),
      h("p.measure", {}, S.common.notFoundBody),
      h("a.btn.btn--accent", { href: "/" }, S.common.homeCta),
    ),
  );
}

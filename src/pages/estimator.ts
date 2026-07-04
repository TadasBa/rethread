/* Taisymo skaičiuoklė — hosts the Repair Desk estimator. */
import { h } from "../lib/dom";
import { S } from "../i18n/strings";
import type { RouteContext } from "../router";
import { pageHead } from "./_helpers";
import { buildEstimator } from "../components/estimator/desk";
import { REPAIRS, type RepairId } from "../content/pricing";

export function renderEstimator(ctx: RouteContext): HTMLElement {
  const addParam = ctx.query.get("add");
  const pending = REPAIRS.some((r) => r.id === addParam)
    ? (addParam as RepairId)
    : undefined;

  return h(
    "div.page.page-estimator",
    {},
    h("section.panel.panel--raw.panel--tight", {},
      h("div.shell", {},
        pageHead({ title: S.estimator.title, lead: S.estimator.lead }),
        buildEstimator(pending),
      ),
    ),
  );
}

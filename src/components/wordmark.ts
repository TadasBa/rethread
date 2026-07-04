/* ============================================================================
   Wordmark — "rethread" set in Bricolage, tied off with a running stitch that
   passes under the word and finishes in an ochre knot. On hover the stitch
   "sews" across. The mark IS the brand's stitch language in miniature.
   ========================================================================== */

import { h, s } from "../lib/dom";

export function wordmark(opts: { href?: string; label?: string } = {}): HTMLElement {
  const { href = "/", label = "Rethread — į pradžią" } = opts;

  // The stitch: a dashed line under the word with a knot at the end.
  const stitch = s(
    "svg.wordmark__stitch",
    { viewBox: "0 0 132 12", "aria-hidden": "true", preserveAspectRatio: "none" },
    s("path.wordmark__thread", {
      d: "M2 7 L118 7",
      fill: "none",
    }),
    s("circle.wordmark__knot", { cx: "124", cy: "7", r: "3.4" }),
  );

  return h(
    "a.wordmark",
    { href, "aria-label": label },
    h("span.wordmark__text", {}, "rethread"),
    stitch,
  );
}

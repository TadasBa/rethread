/* ============================================================================
   Garment silhouettes — clean line-art SVGs. viewBox is 0 0 200 240 for every
   garment. Repair location pins are placed by the user (see desk.ts), not
   pre-anchored.
   ========================================================================== */

import { s } from "../../lib/dom";
import type { GarmentId } from "../../content/pricing";

const PATHS: Record<GarmentId, string> = {
  // Shirt / top
  top: "M62,38 L40,56 L28,98 L50,106 L56,82 L56,206 L144,206 L144,82 L150,106 L172,98 L160,56 L138,38 C129,52 116,58 100,58 C84,58 71,52 62,38 Z",
  // Trousers / bottom
  bottom:
    "M56,34 L144,34 L146,64 L152,214 L112,214 L100,100 L88,214 L48,214 L54,64 Z",
  // Dress / one-piece
  dress:
    "M70,38 L60,46 L48,78 L64,84 L70,68 L72,112 L44,214 L156,214 L128,112 L130,68 L136,84 L152,78 L140,46 L130,38 C122,50 112,54 100,54 C88,54 78,50 70,38 Z",
  // Coat / outerwear
  outerwear:
    "M62,36 L38,54 L26,98 L48,106 L54,82 L54,216 L146,216 L146,82 L152,106 L174,98 L162,54 L138,36 L112,54 L100,74 L88,54 Z",
};

/** Build a garment silhouette SVG. Returns the <svg> with class hooks. */
export function garmentSvg(id: GarmentId, opts: { className?: string } = {}): SVGElement {
  return s(
    `svg.garment-svg${opts.className ? "." + opts.className : ""}`,
    { viewBox: "0 0 200 240", role: "img", "aria-hidden": "true", fill: "none" },
    // Subtle fill cloth
    s("path.garment-fill", { d: PATHS[id] }),
    // Outline
    s("path.garment-outline", { d: PATHS[id] }),
    // A guiding centre seam, dashed
    s("path.garment-guide", {
      d: id === "bottom" ? "M100,40 L100,96" : "M100,60 L100,200",
      "stroke-dasharray": "5 6",
    }),
  );
}

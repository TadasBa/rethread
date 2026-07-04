/* ============================================================================
   Garment silhouettes — clean line-art SVGs. viewBox is 0 0 200 240 for every
   garment. Repair location pins are placed by the user (see desk.ts), not
   pre-anchored.
   ========================================================================== */

import { s } from "../../lib/dom";
import type { GarmentId } from "../../content/pricing";

const PATHS: Record<GarmentId, { shape: string; detail?: string; stitch?: string }> = {
  shirt: {
    shape: "M72,38 L54,46 L34,66 L20,154 L46,164 L58,92 L58,210 L142,210 L142,92 L154,164 L180,154 L166,66 L146,46 L128,38 C122,54 112,62 100,62 C88,62 78,54 72,38 Z",
    detail: "M76,42 L100,72 L124,42 M58,92 L142,92 M42,154 L50,150 M158,154 L150,150 M82,100 L118,100 M72,206 L128,206",
    stitch: "M100,84 L100,198",
  },
  tshirt: {
    shape: "M68,42 L48,56 L28,88 L50,104 L58,84 L58,206 L142,206 L142,84 L150,104 L172,88 L152,56 L132,42 C124,54 114,60 100,60 C86,60 76,54 68,42 Z",
    detail: "M78,48 C86,64 114,64 122,48 M60,84 L140,84 M70,206 L130,206",
    stitch: "M100,78 L100,198",
  },
  knit: {
    shape: "M60,42 L36,62 L24,156 L50,164 L58,100 L58,206 L142,206 L142,100 L150,164 L176,156 L164,62 L140,42 C128,58 116,66 100,66 C84,66 72,58 60,42 Z",
    detail: "M80,50 C88,64 112,64 120,50 M58,96 L142,96 M66,206 L134,206 M48,164 L56,158 M152,164 L144,158 M42,82 L56,154 M158,82 L144,154",
    stitch: "M100,96 L100,196",
  },
  blazer: {
    shape: "M66,38 L42,58 L28,150 L52,160 L62,100 L62,218 L138,218 L138,100 L148,160 L172,150 L158,58 L134,38 C126,52 114,60 100,60 C86,60 74,52 66,38 Z",
    detail: "M72,58 L96,104 L82,126 M128,58 L104,104 L118,126 M100,112 L100,218 M62,138 L86,138 M114,138 L138,138 M50,160 L56,154 M150,160 L144,154",
    stitch: "M100,126 L100,206",
  },
  outerwear: {
    shape: "M72,40 C78,22 122,22 128,40 L160,56 L178,142 L154,152 L140,88 L146,224 L54,224 L60,88 L46,152 L22,142 L40,56 Z",
    detail: "M76,42 C86,62 114,62 124,42 M86,62 L100,94 L114,62 M64,104 L136,104 M70,158 L94,158 M106,158 L130,158",
    stitch: "M100,94 L100,222",
  },
  trousers: {
    shape: "M56,34 L144,34 L146,64 L152,214 L112,214 L100,100 L88,214 L48,214 L54,64 Z",
    detail: "M58,64 L144,64 M72,76 L88,76 M112,76 L128,76",
    stitch: "M100,42 L100,100 M90,110 L80,204 M110,110 L120,204",
  },
  leggings: {
    shape: "M62,34 L138,34 L140,66 L144,216 L110,216 L100,104 L90,216 L56,216 L60,66 Z",
    detail: "M62,64 L138,64 M58,204 L88,204 M112,204 L142,204",
    stitch: "M100,42 L100,104 M90,112 L82,204 M110,112 L118,204",
  },
  skirt: {
    shape: "M62,54 L138,54 L150,214 L50,214 Z",
    detail: "M66,54 C76,70 124,70 134,54 M72,88 L128,88 M60,202 L140,202",
    stitch: "M100,72 L100,202",
  },
  shorts: {
    shape: "M54,44 L146,44 L148,82 L170,198 L120,198 L100,126 L80,198 L30,198 L52,82 Z",
    detail: "M60,82 L140,82 M100,82 L100,126",
    stitch: "M100,50 L100,124 M82,126 L72,190 M118,126 L128,190",
  },
  dress: {
    shape: "M70,38 L60,46 L48,78 L64,84 L70,68 L72,112 L44,214 L156,214 L128,112 L130,68 L136,84 L152,78 L140,46 L130,38 C122,50 112,54 100,54 C88,54 78,50 70,38 Z",
    detail: "M82,48 C90,60 110,60 118,48 M72,112 L128,112 M58,202 L142,202",
    stitch: "M100,66 L100,202",
  },
  jumpsuit: {
    shape: "M70,38 L52,52 L42,86 L60,94 L70,68 L72,112 L54,216 L88,216 L100,128 L112,216 L146,216 L128,112 L130,68 L140,94 L158,86 L148,52 L130,38 C122,50 112,56 100,56 C88,56 78,50 70,38 Z",
    detail: "M82,112 L118,112 M82,48 C90,60 110,60 118,48",
    stitch: "M100,70 L100,126 M90,136 L82,206 M110,136 L118,206",
  },
};

function stitchFor(id: GarmentId): string {
  return PATHS[id].stitch ?? "M100,60 L100,200";
}

/** Build a garment silhouette SVG. Returns the <svg> with class hooks. */
export function garmentSvg(id: GarmentId, opts: { className?: string } = {}): SVGElement {
  const path = PATHS[id];
  return s(
    `svg.garment-svg${opts.className ? "." + opts.className : ""}`,
    { viewBox: "0 0 200 240", role: "img", "aria-hidden": "true", fill: "none" },
    s("path.garment-fill", { d: path.shape }),
    s("path.garment-outline", { d: path.shape }),
    path.detail ? s("path.garment-detail", { d: path.detail }) : null,
    s("path.garment-guide", {
      d: stitchFor(id),
      "stroke-dasharray": "5 6",
    }),
  );
}

/* ============================================================================
   PRICING — single source of truth for the Repair Desk estimator.

   ▸ OWNER: this is the only file you need to edit to change prices, turnaround
     times, repair names, or which repairs apply to which garment.
   ▸ All prices are "from" (nuo) figures in EUR and are shown as PRELIMINARY.
     The final price is confirmed after the garment is inspected. Keep them
     conservative so a quote is never lower than reality.
   ▸ `days` is the working-day estimate for that single repair; the estimator
     shows the longest one across the chosen repairs, clamped to 3–7 d.d.
   ▸ `ask` is the one thing the sewer most needs to know for that repair — it
     becomes a prompt on the order form so the assignment is unambiguous.
   ========================================================================== */

export type GarmentId = "top" | "bottom" | "dress" | "outerwear";
export type RepairId = "hem" | "taper" | "zipper" | "patch" | "seam" | "button" | "lining";

export interface Garment {
  id: GarmentId;
  label: string;
  desc: string;
}

export interface Repair {
  id: RepairId;
  label: string;
  desc: string;
  /** From-price per garment class (EUR). Omit a garment where it doesn't apply. */
  price: Partial<Record<GarmentId, number>>;
  /** Working days for this repair alone. */
  days: number;
  /** The key question the sewer needs answered (shown on the order form). */
  ask: string;
}

export const GARMENTS: Garment[] = [
  { id: "top", label: "Marškiniai, megztiniai", desc: "Marškiniai, palaidinės, megztiniai, švarkeliai" },
  { id: "bottom", label: "Kelnės, sijonai", desc: "Kelnės, džinsai, sijonai, šortai" },
  { id: "dress", label: "Suknelės", desc: "Suknelės, sarafanai, kombinezonai" },
  { id: "outerwear", label: "Paltai, striukės", desc: "Paltai, striukės su pamušalu, švarkai" },
];

export const REPAIRS: Repair[] = [
  {
    id: "hem",
    label: "Trumpinimas",
    desc: "Klešnės, rankovės ar apačios sutrumpinimas išsaugant originalų kraštą",
    price: { top: 14, bottom: 12, dress: 18, outerwear: 20 },
    days: 3,
    ask: "Kiek sutrumpinti? Pvz. „5 cm“ arba „iki kulkšnies“.",
  },
  {
    id: "taper",
    label: "Siaurinimas",
    desc: "Drabužio susiaurinimas pagal figūrą",
    price: { top: 20, bottom: 18, dress: 26, outerwear: 30 },
    days: 4,
    ask: "Kur ir kiek susiaurinti? Pvz. „klešnes per 2 cm“.",
  },
  {
    id: "zipper",
    label: "Užtrauktukas",
    desc: "Užtrauktuko ar slankiklio keitimas / taisymas",
    price: { top: 18, bottom: 16, dress: 22, outerwear: 28 },
    days: 4,
    ask: "Kur yra užtrauktukas, kokia jo spalva ir apytikslis ilgis?",
  },
  {
    id: "patch",
    label: "Skylė ar plyšys",
    desc: "Nematomas taisymas arba matomas „boro“ lopinys",
    price: { top: 12, bottom: 12, dress: 14, outerwear: 16 },
    days: 3,
    ask: "Skylės dydis ir vieta. Nematomas taisymas ar matomas lopinys?",
  },
  {
    id: "seam",
    label: "Siūlė",
    desc: "Išsiuvusios ar prakiurusios siūlės sutvirtinimas",
    price: { top: 10, bottom: 10, dress: 12, outerwear: 14 },
    days: 2,
    ask: "Kurios siūlės išsiuvusios?",
  },
  {
    id: "button",
    label: "Sagos",
    desc: "Sagų prisiuvimas ar keitimas, kilpelės taisymas",
    price: { top: 5, bottom: 5, dress: 5, outerwear: 6 },
    days: 2,
    ask: "Kiek sagų? Ar turite atsargines?",
  },
  {
    id: "lining",
    label: "Pamušalas",
    desc: "Pamušalo taisymas ar keitimas",
    price: { dress: 30, outerwear: 35 },
    days: 6,
    ask: "Kokia pamušalo problema ir kurioje vietoje?",
  },
];

/* --- Helpers (used by the estimator + order summary) --------------------- */

export const garmentById = (id: GarmentId): Garment =>
  GARMENTS.find((g) => g.id === id) as Garment;

export const repairById = (id: RepairId): Repair =>
  REPAIRS.find((r) => r.id === id) as Repair;

/** Repairs available for a garment (i.e. have a price for it). */
export function repairsFor(garment: GarmentId): Repair[] {
  return REPAIRS.filter((r) => r.price[garment] != null);
}

export function priceOf(repair: RepairId, garment: GarmentId): number | null {
  return repairById(repair).price[garment] ?? null;
}

/** From-total for a set of repairs on a garment. */
export function totalFrom(garment: GarmentId, repairs: RepairId[]): number {
  return repairs.reduce((sum, r) => sum + (priceOf(r, garment) ?? 0), 0);
}

/** Combined turnaround (longest single repair), clamped to the 3–7 d.d. window. */
export function turnaroundFor(repairs: RepairId[]): [number, number] {
  if (repairs.length === 0) return [3, 7];
  const longest = Math.max(...repairs.map((r) => repairById(r).days));
  const lo = Math.min(Math.max(3, longest - 1), 6);
  return [lo, Math.max(lo + 1, Math.min(7, longest + 2))];
}

export const fmtEur = (n: number): string => `${n} €`;

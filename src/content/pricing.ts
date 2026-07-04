/* ============================================================================
   PRICING — single source of truth for the Repair Desk estimator.

   ▸ OWNER: edit this file to change prices, turnaround, repair names, or which
     repairs apply to which garment.
   ▸ Prices are fixed customer-facing service prices in EUR.
   ▸ `days` is kept as internal service metadata. The customer-facing turnaround
     currently stays fixed at 3–7 d.d. across the estimator and order summary.
   ▸ `ask` is the one thing the sewer most needs to know for that repair — it
     becomes a prompt on the order form so the assignment is unambiguous.
   ========================================================================== */

export type GarmentId =
  | "shirt"
  | "tshirt"
  | "knit"
  | "blazer"
  | "outerwear"
  | "trousers"
  | "leggings"
  | "skirt"
  | "shorts"
  | "dress"
  | "jumpsuit";

export type RepairId =
  | "bottom-hem"
  | "sleeve-shortening"
  | "shortening"
  | "leg-taper"
  | "waist-taper"
  | "strap-shortening"
  | "jumpsuit-leg-shortening"
  | "side-taper"
  | "zipper"
  | "hole-seam"
  | "seam"
  | "button";

export interface Garment {
  id: GarmentId;
  label: string;
  desc: string;
}

export interface Repair {
  id: RepairId;
  label: string;
  desc: string;
  /** Fixed price per garment class (EUR). Omit a garment where it doesn't apply. */
  price: Partial<Record<GarmentId, number>>;
  /** Working days for this repair alone. */
  days: number;
  /** The key question the sewer needs answered (shown on the order form). */
  ask: string;
}

export const GARMENTS: Garment[] = [
  { id: "shirt", label: "Marškiniai", desc: "Ilgomis rankovėmis, sagomis arba be jų" },
  { id: "tshirt", label: "Marškinėliai", desc: "Trumpomis rankovėmis, trikotažas" },
  { id: "knit", label: "Megztinis / džemperis", desc: "Megztiniai, džemperiai, tamprus trikotažas" },
  { id: "blazer", label: "Švarkas", desc: "Lengvas švarkas, kostiumo viršus" },
  { id: "outerwear", label: "Striukė / paltas", desc: "Lauko drabužiai, storesni sluoksniai" },
  { id: "trousers", label: "Kelnės", desc: "Kelnės ir džinsai" },
  { id: "leggings", label: "Tamprės", desc: "Elastingos kelnės, sportinis trikotažas" },
  { id: "skirt", label: "Sijonas", desc: "Mini, midi, su pamušalu arba be jo" },
  { id: "shorts", label: "Šortai", desc: "Trumpos kelnės, džinsiniai ar medvilniniai" },
  { id: "dress", label: "Suknelė", desc: "Suknelės ir sarafanai" },
  { id: "jumpsuit", label: "Kombinezonas", desc: "Vienos dalies drabužis su petnešomis ar rankovėmis" },
];

export const REPAIRS: Repair[] = [
  {
    id: "bottom-hem",
    label: "Apačios lenkimas",
    desc: "Drabužio apačios palenkimas ir sutvirtinimas",
    price: { shirt: 15, tshirt: 15, knit: 15, blazer: 15 },
    days: 3,
    ask: "Kiek palenkti apačią? Pvz. „3 cm“.",
  },
  {
    id: "sleeve-shortening",
    label: "Rankovių trumpinimas",
    desc: "Rankovių trumpinimas išsaugant tvarkingą kraštą",
    price: { shirt: 15, tshirt: 15, knit: 10, blazer: 15, outerwear: 15, dress: 15 },
    days: 3,
    ask: "Kiek trumpinti rankoves? Pvz. „5 cm“ arba „iki riešo“.",
  },
  {
    id: "shortening",
    label: "Trumpinimas",
    desc: "Kelnių, sijono, šortų ar suknelės ilgio trumpinimas",
    price: { trousers: 15, leggings: 15, skirt: 15, shorts: 15, dress: 15 },
    days: 3,
    ask: "Kiek sutrumpinti? Pvz. „5 cm“ arba „iki kulkšnies“.",
  },
  {
    id: "leg-taper",
    label: "Klešnių siaurinimas",
    desc: "Kelnių ar šortų klešnių susiaurinimas",
    price: { trousers: 20, shorts: 20 },
    days: 4,
    ask: "Kur ir kiek siaurinti klešnes? Pvz. „nuo kelio per 2 cm“.",
  },
  {
    id: "waist-taper",
    label: "Siaurinimas per juosmenį",
    desc: "Juosmens susiaurinimas pagal figūrą",
    price: { trousers: 20, skirt: 20, shorts: 20 },
    days: 4,
    ask: "Kiek siaurinti per juosmenį? Pvz. „2 cm“.",
  },
  {
    id: "strap-shortening",
    label: "Petnešų trumpinimas",
    desc: "Petnešų ar petnešėlių trumpinimas",
    price: { dress: 15, jumpsuit: 15 },
    days: 3,
    ask: "Kiek trumpinti petnešas? Pvz. „2 cm“.",
  },
  {
    id: "jumpsuit-leg-shortening",
    label: "Kelnių dalies trumpinimas",
    desc: "Kombinezono kelnių dalies ilgio trumpinimas",
    price: { jumpsuit: 15 },
    days: 3,
    ask: "Kiek trumpinti kelnių dalį? Pvz. „5 cm“.",
  },
  {
    id: "side-taper",
    label: "Siaurinimas per šonus",
    desc: "Drabužio susiaurinimas per šonus pagal figūrą",
    price: { shirt: 20, tshirt: 20, knit: 20, blazer: 20, outerwear: 20, dress: 20, jumpsuit: 20 },
    days: 4,
    ask: "Kur ir kiek siaurinti per šonus? Pvz. „liemens srityje per 2 cm“.",
  },
  {
    id: "zipper",
    label: "Užtrauktuko keitimas",
    desc: "Užtrauktuko keitimas arba taisymas",
    price: { knit: 17, outerwear: 30, trousers: 30, skirt: 30, shorts: 30, dress: 30, jumpsuit: 30 },
    days: 4,
    ask: "Kur yra užtrauktukas, kokia jo spalva ir apytikslis ilgis?",
  },
  {
    id: "hole-seam",
    label: "Skylių / siūlių tvarkymas",
    desc: "Skylės, plyšio arba iširusios siūlės sutvarkymas",
    price: {
      shirt: 20,
      tshirt: 20,
      knit: 20,
      outerwear: 20,
      trousers: 25,
      leggings: 20,
      skirt: 20,
      shorts: 20,
      dress: 20,
      jumpsuit: 20,
    },
    days: 3,
    ask: "Kur yra skylė ar siūlė? Nurodykite dydį ir vietą.",
  },
  {
    id: "seam",
    label: "Siūlių sutvarkymas",
    desc: "Iširusios ar prakiurusios siūlės sutvirtinimas",
    price: { blazer: 20 },
    days: 3,
    ask: "Kurios siūlės iširusios?",
  },
  {
    id: "button",
    label: "Sagų tvirtinimas / keitimas",
    desc: "Sagų prisiuvimas, tvirtinimas arba keitimas",
    price: { shirt: 25, knit: 25, blazer: 25, outerwear: 25, trousers: 25, shorts: 25, dress: 25, jumpsuit: 25 },
    days: 2,
    ask: "Kiek sagų? Ar turite atsargines?",
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

/** Total fixed price for a set of repairs on a garment. */
export function totalPrice(garment: GarmentId, repairs: RepairId[]): number {
  return repairs.reduce((sum, r) => sum + (priceOf(r, garment) ?? 0), 0);
}

/** Current customer-facing turnaround promise. */
export function turnaroundFor(_repairs: RepairId[]): [number, number] {
  return [3, 7];
}

export const fmtEur = (n: number): string => `${n} €`;

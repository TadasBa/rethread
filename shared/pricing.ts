import pricingData from "./pricing-data.json";

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
  price: Partial<Record<GarmentId, number>>;
  days: number;
  ask: string;
}

export const GARMENTS = pricingData.garments as Garment[];
export const REPAIRS = pricingData.repairs as Repair[];

const garmentMap = new Map<GarmentId, Garment>(GARMENTS.map((g) => [g.id, g]));
const repairMap = new Map<RepairId, Repair>(REPAIRS.map((r) => [r.id, r]));

export function isGarmentId(value: unknown): value is GarmentId {
  return typeof value === "string" && garmentMap.has(value as GarmentId);
}

export function isRepairId(value: unknown): value is RepairId {
  return typeof value === "string" && repairMap.has(value as RepairId);
}

export function garmentById(id: GarmentId): Garment {
  return garmentMap.get(id) as Garment;
}

export function repairById(id: RepairId): Repair {
  return repairMap.get(id) as Repair;
}

export function repairsFor(garment: GarmentId): Repair[] {
  return REPAIRS.filter((r) => r.price[garment] != null);
}

export function priceOf(repair: RepairId, garment: GarmentId): number | null {
  return repairById(repair).price[garment] ?? null;
}

export function totalPrice(garment: GarmentId, repairs: RepairId[]): number {
  return repairs.reduce((sum, repair) => sum + (priceOf(repair, garment) ?? 0), 0);
}

export function turnaroundFor(_repairs: RepairId[]): [number, number] {
  return [3, 7];
}

export const fmtEur = (n: number): string => `${n} €`;

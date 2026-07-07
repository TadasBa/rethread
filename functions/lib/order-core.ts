import {
  garmentById,
  isGarmentId,
  isRepairId,
  priceOf,
  repairById,
  totalPrice,
  turnaroundFor,
  type GarmentId,
  type RepairId,
} from "../../shared/pricing";

export interface Photo {
  name: string;
  type: string;
  base64: string;
}

export interface TrustedRepairLine {
  id: RepairId;
  label: string;
  price: number;
  detail: string;
  location: string | null;
}

export interface TrustedOrder {
  name: string;
  email: string;
  phone: string;
  shipping: string;
  notes: string;
  garment: {
    id: GarmentId;
    label: string;
    type: string;
    color: string;
  };
  repairs: TrustedRepairLine[];
  totalPrice: number;
  turnaround: [number, number];
  photos: Photo[];
}

export type OrderValidation =
  | { ok: true; order: TrustedOrder }
  | { ok: false; status: 400 | 413 | 422; error: string };

type PhotoValidation =
  | { ok: true; photos: Photo[] }
  | { ok: false; status: 413 | 422; error: string };

const MAX_REPAIRS = 8;
const MAX_PHOTOS = 5;
const MAX_PHOTO_BASE64 = 5_700_000;
const MAX_TOTAL_PHOTO_BASE64 = 27_500_000;
const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function maybeRecord(value: unknown): Record<string, unknown> {
  return isRecord(value) ? value : {};
}

function validatePhotos(value: unknown): PhotoValidation {
  if (value == null) return { ok: true, photos: [] };
  if (!Array.isArray(value) || value.length > MAX_PHOTOS) {
    return { ok: false, status: 413, error: "too_many_photos" };
  }

  let totalBase64 = 0;
  const photos: Photo[] = [];
  for (const item of value) {
    if (!isRecord(item)) return { ok: false, status: 422, error: "invalid_photo" };
    const name = text(item.name, 120) || "nuotrauka.jpg";
    const type = text(item.type, 80);
    const base64 = text(item.base64, MAX_PHOTO_BASE64 + 1);
    if (!/^image\/(jpeg|jpg|png|webp|heic|heif)$/i.test(type)) {
      return { ok: false, status: 422, error: "invalid_photo_type" };
    }
    if (!base64 || base64.length > MAX_PHOTO_BASE64) {
      return { ok: false, status: 413, error: "photo_too_large" };
    }
    totalBase64 += base64.length;
    if (totalBase64 > MAX_TOTAL_PHOTO_BASE64) {
      return { ok: false, status: 413, error: "photos_too_large" };
    }
    photos.push({ name, type, base64 });
  }

  return { ok: true, photos };
}

export function validateOrderPayload(payload: unknown): OrderValidation {
  if (!isRecord(payload)) return { ok: false, status: 400, error: "invalid_payload" };

  const name = text(payload.name, 80);
  const email = text(payload.email, 160).toLowerCase();
  const phone = text(payload.phone, 40);
  const shipping = text(payload.shipping, 40);
  const notes = text(payload.notes, 1000);
  const consent = payload.consent === true;

  if (!name) return { ok: false, status: 422, error: "missing_name" };
  if (!emailRe.test(email)) return { ok: false, status: 422, error: "invalid_email" };
  if (!consent) return { ok: false, status: 422, error: "missing_consent" };
  if (!isGarmentId(payload.garmentId)) return { ok: false, status: 400, error: "invalid_garment" };

  const repairIdsRaw = payload.repairIds;
  if (!Array.isArray(repairIdsRaw) || repairIdsRaw.length === 0) {
    return { ok: false, status: 400, error: "missing_repairs" };
  }
  if (repairIdsRaw.length > MAX_REPAIRS) {
    return { ok: false, status: 413, error: "too_many_repairs" };
  }

  const garmentId = payload.garmentId;
  const repairIds: RepairId[] = [];
  for (const raw of repairIdsRaw) {
    if (!isRepairId(raw)) return { ok: false, status: 400, error: "invalid_repair" };
    if (repairIds.includes(raw)) continue;
    if (priceOf(raw, garmentId) == null) {
      return { ok: false, status: 400, error: "repair_not_available_for_garment" };
    }
    repairIds.push(raw);
  }
  if (repairIds.length === 0) return { ok: false, status: 400, error: "missing_repairs" };

  const garmentInfo = maybeRecord(payload.garmentInfo);
  const repairDetails = maybeRecord(payload.repairDetails);
  const repairLocations = maybeRecord(payload.repairLocations);
  const photosResult = validatePhotos(payload.photos);
  if (!photosResult.ok) return photosResult;

  const repairs = repairIds.map((id) => {
    const price = priceOf(id, garmentId);
    return {
      id,
      label: repairById(id).label,
      price: price as number,
      detail: text(repairDetails[id], 300),
      location: text(repairLocations[id], 80) || null,
    };
  });

  return {
    ok: true,
    order: {
      name,
      email,
      phone,
      shipping,
      notes,
      garment: {
        id: garmentId,
        label: garmentById(garmentId).label,
        type: text(garmentInfo.type, 120),
        color: text(garmentInfo.color, 80),
      },
      repairs,
      totalPrice: totalPrice(garmentId, repairIds),
      turnaround: turnaroundFor(repairIds),
      photos: photosResult.photos,
    },
  };
}

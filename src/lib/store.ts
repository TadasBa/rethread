/* ============================================================================
   Estimator store — a tiny observable that survives client-side navigation and
   persists to sessionStorage, so the chosen repairs prefill the order form.
   ========================================================================== */

import type { GarmentId, RepairId } from "../content/pricing";

export interface Spot {
  x: number; // 0..1 normalized within the garment box
  y: number;
}

export interface EstimateState {
  garment: GarmentId | null;
  repairs: RepairId[];
  /** Optional user-marked location of each repair on the garment. */
  spots: Partial<Record<RepairId, Spot>>;
}

const KEY = "rethread.estimate.v1";
type Listener = (state: EstimateState) => void;

function load(): EstimateState {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as EstimateState;
      if (parsed && Array.isArray(parsed.repairs)) return { ...parsed, spots: parsed.spots ?? {} };
    }
  } catch {
    /* ignore */
  }
  return { garment: null, repairs: [], spots: {} };
}

let state: EstimateState = load();
const listeners = new Set<Listener>();

function commit(): void {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage may be unavailable — feature still works in-memory */
  }
  for (const fn of listeners) fn(state);
}

export const estimate = {
  get: (): EstimateState => state,

  subscribe(fn: Listener): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  setGarment(garment: GarmentId): void {
    if (state.garment === garment) return;
    // A different garment invalidates any placed spots.
    state = { ...state, garment, spots: {} };
    commit();
  },

  toggleRepair(repair: RepairId): void {
    const has = state.repairs.includes(repair);
    const spots = { ...state.spots };
    if (has) delete spots[repair];
    state = {
      ...state,
      repairs: has ? state.repairs.filter((r) => r !== repair) : [...state.repairs, repair],
      spots,
    };
    commit();
  },

  hasRepair: (repair: RepairId): boolean => state.repairs.includes(repair),

  removeRepair(repair: RepairId): void {
    if (!state.repairs.includes(repair)) return;
    const spots = { ...state.spots };
    delete spots[repair];
    state = { ...state, repairs: state.repairs.filter((r) => r !== repair), spots };
    commit();
  },

  setRepairs(repairs: RepairId[]): void {
    const spots: Partial<Record<RepairId, Spot>> = {};
    for (const r of repairs) if (state.spots[r]) spots[r] = state.spots[r];
    state = { ...state, repairs, spots };
    commit();
  },

  setSpot(repair: RepairId, spot: Spot): void {
    state = { ...state, spots: { ...state.spots, [repair]: spot } };
    commit();
  },

  reset(): void {
    state = { garment: null, repairs: [], spots: {} };
    commit();
  },
};

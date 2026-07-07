import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outDir = await mkdtemp(join(tmpdir(), "rethread-order-core-"));
const outFile = join(outDir, "order-core.mjs");

await build({
  entryPoints: ["functions/lib/order-core.ts"],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "es2022",
  logLevel: "silent",
});

const { validateOrderPayload } = await import(pathToFileURL(outFile).href);

const validPayload = {
  name: "Austeja",
  email: "austeja@example.com",
  phone: "+37060000000",
  shipping: "Paštomatu",
  notes: "Prašau susisiekti prieš siunčiant.",
  consent: true,
  garmentId: "trousers",
  repairIds: ["shortening", "zipper"],
  repairDetails: {
    shortening: "Trumpinti 4 cm.",
    zipper: "Tamsus užtrauktukas.",
  },
  repairLocations: {
    zipper: "vidurys · centras",
  },
  photos: [],
};

test("calculates trusted prices from garment and repair IDs", () => {
  const result = validateOrderPayload({
    ...validPayload,
    totalPrice: 1,
    estimate: {
      garment: "Injected label",
      repairs: [{ label: "Free repair", price: 1 }],
      totalPrice: 1,
      turnaround: [1, 1],
    },
  });

  assert.equal(result.ok, true);
  assert.equal(result.order.totalPrice, 45);
  assert.equal(result.order.repairs[0].label, "Trumpinimas");
  assert.equal(result.order.repairs[0].price, 15);
  assert.equal(result.order.repairs[1].label, "Užtrauktuko keitimas");
  assert.deepEqual(result.order.turnaround, [3, 7]);
});

test("rejects unknown repair IDs", () => {
  const result = validateOrderPayload({ ...validPayload, repairIds: ["shortening", "fake-repair"] });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("rejects repairs unavailable for the selected garment", () => {
  const result = validateOrderPayload({ ...validPayload, repairIds: ["seam"] });
  assert.equal(result.ok, false);
  assert.equal(result.status, 400);
});

test("rejects malformed or incomplete payloads", () => {
  assert.equal(validateOrderPayload(null).ok, false);
  assert.equal(validateOrderPayload({ ...validPayload, email: "bad" }).ok, false);
  assert.equal(validateOrderPayload({ ...validPayload, consent: false }).ok, false);
  assert.equal(validateOrderPayload({ ...validPayload, repairIds: [] }).ok, false);
});

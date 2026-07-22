import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { pathToFileURL } from "node:url";
import { build } from "esbuild";

const outDir = await mkdtemp(join(tmpdir(), "rethread-order-api-"));
const outFile = join(outDir, "order-api.mjs");

await build({
  entryPoints: ["functions/api/order.ts"],
  outfile: outFile,
  bundle: true,
  platform: "node",
  format: "esm",
  target: "es2022",
  logLevel: "silent",
});

const { onRequestPost } = await import(pathToFileURL(outFile).href);

const validPayload = {
  name: "Austėja",
  email: "austeja@example.com",
  phone: "+37060000000",
  shipping: "Paštomatu",
  notes: "Prašau susisiekti prieš siunčiant.",
  consent: true,
  garmentId: "trousers",
  repairIds: ["shortening"],
  repairDetails: { shortening: "Trumpinti 4 cm." },
  repairLocations: {},
  photos: [],
};

function request(body, host = "http://localhost/api/order") {
  return new Request(host, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
}

test("returns a development success without contacting Resend", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = () => {
    throw new Error("unexpected fetch");
  };

  try {
    const response = await onRequestPost({ request: request(validPayload), env: {} });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true, dev: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("rejects invalid JSON before validation", async () => {
  const response = await onRequestPost({ request: request("{"), env: {} });
  assert.equal(response.status, 400);
  assert.deepEqual(await response.json(), { error: "invalid_json" });
});

test("fails closed on production when the Turnstile secret is missing", async () => {
  const response = await onRequestPost({
    request: request(validPayload, "https://rethread.lt/api/order"),
    env: {},
  });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: "temporarily_unavailable" });
});

test("sends escaped admin content and a customer confirmation", async () => {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url, payload: JSON.parse(init.body) });
    return new Response(JSON.stringify({ id: `email-${calls.length}` }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };

  try {
    const response = await onRequestPost({
      request: request({ ...validPayload, notes: "<script>alert(1)</script>" }),
      env: {
        RESEND_API_KEY: "test-key",
        ORDER_TO_EMAIL: "orders@example.com",
        ORDER_FROM_EMAIL: "Rethread <orders@example.com>",
      },
    });

    assert.equal(response.status, 200);
    assert.equal(calls.length, 2);
    assert.equal(calls[0].url, "https://api.resend.com/emails");
    assert.equal(calls[0].payload.to, "orders@example.com");
    assert.match(calls[0].payload.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/);
    assert.doesNotMatch(calls[0].payload.html, /<script>/);
    assert.equal(calls[1].payload.to, "austeja@example.com");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("reports an upstream failure when the admin email is rejected", async () => {
  const originalFetch = globalThis.fetch;
  const originalError = console.error;
  globalThis.fetch = async () => new Response("rejected", { status: 500 });
  console.error = () => undefined;

  try {
    const response = await onRequestPost({
      request: request(validPayload),
      env: { RESEND_API_KEY: "test-key" },
    });
    assert.equal(response.status, 502);
    assert.deepEqual(await response.json(), { error: "email_failed" });
  } finally {
    globalThis.fetch = originalFetch;
    console.error = originalError;
  }
});

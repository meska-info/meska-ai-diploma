import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import ts from "typescript";

// Loads app TypeScript modules with their relative imports (CommonJS via the
// TypeScript compiler), so the real runConversion/runSheetSync code is tested.
const root = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const requireNode = createRequire(import.meta.url);
function loadModule(file, env, fetchImpl, cache = new Map()) {
  if (cache.has(file)) return cache.get(file).exports;
  const loaded = { exports: {} };
  cache.set(file, loaded);
  if (file.endsWith(".json")) {
    loaded.exports = JSON.parse(fs.readFileSync(file, "utf8"));
    return loaded.exports;
  }
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
  }).outputText;
  const localRequire = (specifier) => {
    if (!specifier.startsWith(".")) return requireNode(specifier);
    const base = path.resolve(path.dirname(file), specifier);
    const resolved = [base, `${base}.ts`, `${base}.tsx`, `${base}.json`, path.join(base, "index.ts")].find((candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile());
    if (!resolved) throw new Error(`cannot resolve ${specifier} from ${file}`);
    return loadModule(resolved, env, fetchImpl, cache);
  };
  vm.runInNewContext(source, {
    module: loaded, exports: loaded.exports, require: localRequire, console,
    process: { env }, fetch: fetchImpl, AbortSignal, URL, URLSearchParams, Response, Request, Headers, Buffer, TextEncoder, crypto: globalThis.crypto,
    setTimeout, clearTimeout, Date, Math, JSON, encodeURIComponent, decodeURIComponent,
  });
  return loaded.exports;
}

function pipeline(env) {
  const calls = [];
  const fetchImpl = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    if (String(url).includes("graph.facebook.com")) return Response.json({ events_received: 1 });
    return new Response(null, { status: 204 });
  };
  const exports = loadModule(path.join(root, "app/lib/leadPipeline.ts"), env, fetchImpl);
  return { ...exports, calls };
}
const config = { url: "https://db.example", key: "service" };
const lead = (slug) => ({
  request_id: `lead-${slug}`, created_at: new Date(Date.now() - 60_000).toISOString(),
  name: "Ahmed Zaki", email: "qa@example.com", mobile: "+201012345678", diploma_slug: slug,
  programme_price_value: slug === "online" ? 20000 : 25000, capi_attempts: 0, capi_context: null,
});
const production = { VERCEL_ENV: "production", META_CONVERSIONS_TOKEN: "test-token" };

for (const [slug, variant, value] of [["offline", "41453348880430", 25000], ["online", "41309075341358", 20000]]) {
  test(`the real server Lead for ${slug} carries the ${slug} Shopify variant and value`, async () => {
    const { runConversion, calls } = pipeline(production);
    assert.equal(await runConversion(config, lead(slug)), true);
    const meta = calls.find((call) => call.url.includes("graph.facebook.com"));
    assert.match(meta.url, /\/v25\.0\//);
    const event = JSON.parse(meta.init.body).data[0];
    assert.deepEqual(event.custom_data.content_ids, [variant]);
    assert.equal(event.custom_data.content_type, "product");
    assert.equal(event.custom_data.value, value);
    assert.equal(event.custom_data.currency, "EGP");
    assert.equal(event.event_id, `lead-${slug}`);
    assert.equal(JSON.parse(meta.init.body).test_event_code, undefined);
    const status = calls.find((call) => call.url.startsWith("https://db.example/rest/v1/leads?request_id=eq."));
    assert.equal(JSON.parse(status.init.body).capi_status, "sent");
  });
}

test("Preview never sends a server Lead and never queues a Sheet retry", async () => {
  const preview = pipeline({ VERCEL_ENV: "preview", META_CONVERSIONS_TOKEN: "test-token" });
  assert.equal(await preview.runConversion(config, lead("online")), false);
  assert.equal(preview.calls.length, 0);
  assert.equal(preview.isProductionDeployment(), false);
  const route = fs.readFileSync(path.join(root, "app/api/leads/route.ts"), "utf8");
  assert.match(route, /\.\.\.\(isProductionDeployment\(\) \? \{\} : \{ sheet_sync_status: "legacy", capi_status: "legacy" \}\)/);
  const source = fs.readFileSync(path.join(root, "app/lib/leadPipeline.ts"), "utf8");
  assert.match(source, /attempts >= SHEET_MAX_ATTEMPTS \|\| !isProductionDeployment\(\) \? "failed" : "retrying"/);
});

test("server Lead retries are spread over three days", () => {
  const { capiRetryFilter } = pipeline(production);
  const filter = decodeURIComponent(capiRetryFilter(Date.parse("2026-10-29T12:00:00.000Z")).slice(3));
  assert.equal(filter, "(" + [
    'and(capi_attempts.gte.0,capi_attempts.lt.3,created_at.lt."2026-10-29T11:58:00.000Z")',
    'and(capi_attempts.gte.3,capi_attempts.lt.5,created_at.lt."2026-10-29T11:00:00.000Z")',
    'and(capi_attempts.gte.5,capi_attempts.lt.7,created_at.lt."2026-10-29T06:00:00.000Z")',
    'and(capi_attempts.gte.7,capi_attempts.lt.9,created_at.lt."2026-10-28T12:00:00.000Z")',
    'and(capi_attempts.gte.9,capi_attempts.lt.10,created_at.lt."2026-10-26T12:00:00.000Z")',
  ].join(",") + ")");
});

test("the retry job runs Meta first, gives up on expired work and every Google call has a time limit", () => {
  const job = fs.readFileSync(path.join(root, "app/api/cron/lead-sync/route.ts"), "utf8");
  const order = ["1. Server-side Meta Lead", "2. Give up", "3. Privacy", "4. Google Sheets", "5. Sheet layout"].map((label) => job.indexOf(label));
  assert.ok(order.every((index, i) => index > 0 && (i === 0 || index > order[i - 1])), String(order));
  assert.match(job, /capiRetryFilter\(now\)/);
  const sheets = fs.readFileSync(path.join(root, "app/lib/googleSheets.ts"), "utf8");
  assert.equal((sheets.match(/await fetch\(/g) || []).length, 0);
  assert.match(sheets, /signal: AbortSignal\.timeout\(GOOGLE_TIMEOUT_MS\)/);
});

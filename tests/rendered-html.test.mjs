import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the diploma landing page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<html lang="en">/i);
  assert.match(html, /<title>AI Co-Pilot Diploma \| Meska AI<\/title>/i);
  assert.match(html, /Learn AI for business\./i);
  assert.match(html, /This is not a payment form\./i);
  assert.match(html, /name="fullName"/i);
  assert.match(html, /name="diploma"/i);
  assert.match(html, /Nine sessions engineered for real-world application\./i);
  assert.doesNotMatch(html, /fbq\(|PIXEL_ID|YOUR_PIXEL/i);
});

test("server-renders the thank-you comparison page", async () => {
  const response = await render("/thank-you?diploma=online");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Your AI Co-Pilot Diploma Options \| Meska AI<\/title>/i);
  assert.match(html, /Two routes\. The same practical ambition\./i);
  assert.match(html, /Offline Diploma/i);
  assert.match(html, /Online Diploma/i);
  assert.match(html, /Frequently asked/i);
  assert.match(html, /name="robots" content="noindex, nofollow"/i);
  assert.doesNotMatch(html, /fbq\(|PIXEL_ID|YOUR_PIXEL/i);
});

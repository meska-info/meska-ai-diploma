import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
  assert.match(html, /Meska AI Copilot Diploma/i);
  assert.match(html, /Learn AI\. Apply it to real business\./i);
  assert.match(
    html,
    /Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts\./i,
  );
  assert.match(html, /Why We Built the Diploma/i);
  assert.match(html, /Interested\? Let’s Talk!/i);
  assert.match(html, /No payment is required to submit your application\./i);
  assert.match(html, /name="fullName"/i);
  assert.match(html, /type="hidden" name="diploma" value="offline"/i);
  assert.doesNotMatch(html, /<select[^>]+name="diploma"/i);
  assert.match(html, /role="tablist" aria-label="Diploma format"/i);
  assert.match(html, /Request Offline Diploma Details/i);
  assert.match(html, /5 interest-free payments via Sympl\./i);
  assert.doesNotMatch(html, /class="price-benefits"|>Included</i);
  assert.doesNotMatch(html, /Request Diploma Details|View everything included/i);
  assert.match(html, /Explore the complete curriculum/i);
  assert.match(html, /Explore All Sessions/i);
  assert.match(
    html,
    /\/media\/videos\/original\/meska-ai-diploma-main-video\.mp4/i,
  );
  assert.match(
    html,
    /Professionals from Egypt’s Leading Corporations Learn AI with Meska/i,
  );
  assert.match(
    html,
    /\/media\/images\/optimized\/testimonial-ali-elsheikh\.webp/i,
  );
  assert.match(html, /\/media\/logos\/monochrome\/sodic\.png/i);
  assert.match(html, /\/media\/brand\/original\/meska-2026-logo\.png/i);
  assert.match(html, /<details class="curriculum-disclosure">/i);
  assert.match(html, /Graduation project/i);
  assert.doesNotMatch(html, /<dt>Schedule<\/dt>/i);
  assert.equal((html.match(/class="organization-logo"/g) ?? []).length, 32);
  assert.equal((html.match(/class="logo-sequence"/g) ?? []).length, 2);
  assert.match(html, /class="logo-sequence" aria-hidden="true"/i);
  assert.doesNotMatch(html, /Main diploma video.*Media placeholder/is);
  assert.doesNotMatch(html, /One form\. One clear next step\./i);
  assert.doesNotMatch(html, /final_interest_form/i);
  assert.doesNotMatch(html, /hero-art|Course details/i);
});

test("server-renders the thank-you comparison page", async () => {
  const response = await render("/thank-you?diploma=online");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Application Received \| Meska AI<\/title>/i);
  assert.match(html, /Thank you — we’ve got your details\./i);
  assert.match(html, /A Meska advisor will contact you soon\./i);
  assert.match(html, /One outcome\. Two practical ways to get there\./i);
  assert.match(html, /Offline Diploma/i);
  assert.match(html, /<button[^>]+role="tab"[^>]*>Online<\/button>/i);
  assert.match(html, /role="tablist" aria-label="Diploma format"/i);
  assert.equal((html.match(/class="checkout-card checkout-card-unified"/g) ?? []).length, 1);
  assert.match(html, /Continue with the [\s\S]{0,30}Offline Diploma/i);
  assert.match(html, /Step inside the diploma and see for yourself\./i);
  assert.match(html, /From AI skills to measurable business value\./i);
  assert.match(html, /AI foundations and tool selection/i);
  assert.match(html, /aria-label="AI capabilities"[^>]+role="tablist"/i);
  assert.equal((html.match(/<video\b/g) ?? []).length, 10);
  assert.match(html, /\/media\/videos\/optimized\/graduation-wave\.mp4/i);
  assert.match(html, /\/media\/videos\/optimized\/inside-diploma-session-09\.mp4/i);
  assert.match(html, /Omar El Monayar/i);
  assert.doesNotMatch(html, /Ahmed Mostafa/i);
  assert.match(html, /Clear answers before you decide/i);
  assert.match(html, /Sessions are primarily delivered in Arabic/i);
  assert.match(html, /accepted only before 25% of the diploma has been completed/i);
  assert.match(html, /approximately 15 hours per week/i);
  assert.match(html, /name="robots" content="noindex, nofollow"/i);
});

test("keeps reduced-motion, checkout, and video contracts centralized", () => {
  const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
  const content = readFileSync(new URL("../app/content.ts", import.meta.url), "utf8");
  const sections = readFileSync(
    new URL("../app/components/sections.tsx", import.meta.url),
    "utf8",
  );

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.logo-rail-track[\s\S]*animation:\s*none/i);
  assert.match(css, /\.logo-sequence\[aria-hidden="true"\][\s\S]*display:\s*none/i);
  assert.match(css, /--blue:\s*#021f94/i);
  assert.match(css, /--blue-bright:\s*#f54f1b/i);
  assert.match(
    content,
    /hWNFhIiwrMjiccpLk4S6LHMp\/en-eg\?_r=AQABXK4iXZTRdGRlwSOl9-iRgmnxVhsceC_1stXdBBLG7M8/,
  );
  assert.match(
    content,
    /hWNFBXhbOuMmtlvxCWKSs35n\/en-eg\?_r=AQABZ-KT_ZesRudxZE6egaaE1qln6lpcrLJajz-FxH7Dbfw&cart_link_id=Qtc6lE74&channel=buy_button/,
  );
  assert.equal((content.match(/inside_diploma_video_\d{2}/g) ?? []).length, 9);
  assert.equal((content.match(/leadDestination: null,/g) ?? []).length, 2);
  assert.match(content, /Request Offline Diploma Details/);
  assert.match(content, /Request Online Diploma Details/);
  assert.equal((content.match(/5 interest-free payments via Sympl\./g) ?? []).length, 2);
  assert.match(sections, /pauseOtherPageVideos\(event\.currentTarget\)/);
  assert.match(sections, /pauseOtherPageVideos\(current\)/);
  assert.match(sections, /trackEvent\(\s*"FormSubmit"/);
  assert.match(sections, /trackEvent\("CapabilitySelect"/);
  const tracking = readFileSync(
    new URL("../app/lib/tracking.ts", import.meta.url),
    "utf8",
  );
  const metaPixel = readFileSync(
    new URL("../app/components/MetaPixel.tsx", import.meta.url),
    "utf8",
  );
  assert.match(tracking, /META_PIXEL_ID = "4138749493027663"/);
  assert.match(tracking, /"ViewContent",\s*"Lead",\s*"InitiateCheckout"/s);
  assert.match(tracking, /standardMetaEvents\.has\(event\) \? "track" : "trackCustom"/);
  assert.match(tracking, /pageviews\.at\(-1\) === pathname/);
  assert.match(metaPixel, /id="meska-meta-pixel"/);
  assert.match(metaPixel, /connect\.facebook\.net\/en_US\/fbevents\.js/);
  assert.match(metaPixel, /initializeMetaPixel\(\)/);
  assert.match(metaPixel, /trackMetaPageView\(pathname\)/);
  assert.match(sections, /name="diploma" type="hidden" value=\{selectedId\}/);
  assert.doesNotMatch(sections, /className="price-benefits"/);
  assert.doesNotMatch(sections, /<select[\s\S]{0,200}name="diploma"/);
  assert.match(
    css,
    /\.skills-session-map\s*\{[\s\S]*?display:\s*inline-flex;[\s\S]*?width:\s*fit-content;[\s\S]*?padding:\s*10px 16px;[\s\S]*?white-space:\s*nowrap;/i,
  );
  assert.doesNotMatch(css, /\.skills-value-panel\s*\{[^}]*min-height:\s*100%/i);
});

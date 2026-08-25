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
  assert.match(html, /Meska AI Diploma/i);
  assert.match(html, /Build your first working AI App in/i);
  assert.match(html, /8 Weeks/i);
  assert.match(
    html,
    /Learn by building alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts/i,
  );
  assert.match(html, /Why We Built the Diploma/i);
  assert.match(html, /Create your first AI Agent now/i);
  assert.match(html, /Free access\. No payment required\./i);
  assert.match(html, /name="fullName"/i);
  assert.match(html, /type="hidden" name="diploma" value="offline"/i);
  assert.doesNotMatch(html, /<select[^>]+name="diploma"/i);
  assert.match(html, /role="tablist" aria-label="Diploma format"/i);
  assert.match(html, /Watch Free Guide/i);
  assert.match(html, /Create your first AI Agent now/i);
  assert.match(html, /26 September 2026/i);
  assert.match(html, /Every Saturday from 11AM to 4PM/i);
  assert.doesNotMatch(html, /name="job"|name="company"|name="website"/i);
  assert.match(html, /5 interest-free payments via Sympl\./i);
  assert.doesNotMatch(html, /class="price-benefits"|>Included</i);
  assert.doesNotMatch(html, /Request Diploma Details|View everything included/i);
  assert.match(html, /Explore the complete curriculum/i);
  assert.match(html, /Explore All Sessions/i);
  assert.match(html, /customer-27axu7xjwelxbgon\.cloudflarestream\.com\/[a-f0-9]+\/iframe\?autoplay=true/i);
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
  assert.match(html, /<title>Free AI Agent Guide \| Meska AI<\/title>/i);
  assert.match(html, /Start building your first AI Agent\./i);
  assert.match(html, /Your free practical guide/i);
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
  assert.equal((html.match(/<iframe[^>]+cloudflare-stream-player/g) ?? []).length, 20);
  assert.doesNotMatch(html, /<video\b/i);
  assert.match(html, /Step inside the diploma and see for yourself\./i);
  assert.match(html, /See how other professionals experienced the journey\./i);
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
  const thankYouPage = readFileSync(
    new URL("../app/components/ThankYouPage.tsx", import.meta.url),
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
  assert.equal((content.match(/Watch Free Guide/g) ?? []).length, 3);
  assert.match(content, /26 September 2026/);
  assert.match(content, /27 September 2026/);
  assert.equal((content.match(/5 interest-free payments via Sympl\./g) ?? []).length, 2);
  assert.match(sections, /CloudflareStreamVideo/);
  assert.match(sections, /videoId=\{video\.streamId\}/);
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
  assert.match(tracking, /META_PIXEL_ID = "1982493002344234"/);
  assert.match(tracking, /"ViewContent",\s*"Lead",\s*"InitiateCheckout"/s);
  assert.match(tracking, /standardMetaEvents\.has\(event\) \? "track" : "trackCustom"/);
  assert.match(tracking, /pageviews\.at\(-1\) === pathname/);
  assert.match(tracking, /export function readSessionValue/);
  assert.match(tracking, /export function writeSessionValue/);
  assert.match(sections, /window\.name = `meska-pending-lead:/);
  assert.match(sections, /readSessionValue\("meska-pending-lead"\)/);
  assert.match(thankYouPage, /function FloatingCheckoutCTA/);
  assert.match(thankYouPage, /new IntersectionObserver/);
  assert.match(thankYouPage, /scrollIntoView\(\{/);
  assert.match(thankYouPage, /headerCtaVisible \|\| checkoutCardVisible/);
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

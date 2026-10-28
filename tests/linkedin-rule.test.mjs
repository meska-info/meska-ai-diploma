import assert from "node:assert/strict";
import test from "node:test";
import { parseLinkedIn } from "../app/lib/leadValidation.ts";

const profile = "https://www.linkedin.com/in/ahmed-zaki";
const arabicSlug = encodeURIComponent("أحمد-زكي");

for (const [input, url, kind] of [
  ["https://www.linkedin.com/in/ahmed-zaki", profile, "profile"],
  ["https://m.linkedin.com/in/ahmed-zaki", profile, "profile"],
  ["https://eg.linkedin.com/in/ahmed-zaki", profile, "profile"],
  ["https://www.linkedin.com/in/ahmed-zaki?utm_source=share&utm_medium=member_ios", profile, "profile"],
  ["www.linkedin.com/in/Ahmed-Zaki/", profile, "profile"],
  ["http://linkedin.com/in/ahmed-zaki/en", profile, "profile"],
  ["HTTPS://WWW.LINKEDIN.COM/IN/ahmed-zaki", profile, "profile"],
  ["  https://www.linkedin.com/in/ahmed-zaki#about  ", profile, "profile"],
  ["https://lnkd.in/abc123", "https://lnkd.in/abc123", "short"],
  ["linkedin.com/pub/ahmed-zaki/1/23/456", "https://www.linkedin.com/pub/ahmed-zaki/1/23/456", "pub"],
  [`https://www.linkedin.com/in/${arabicSlug}`, `https://www.linkedin.com/in/${arabicSlug}`, "profile"],
]) {
  test(`accepts LinkedIn ${input.trim()}`, () => {
    const result = parseLinkedIn(input);
    assert.equal(result.ok, true, JSON.stringify(result));
    assert.equal(result.url, url);
    assert.equal(result.kind, kind);
  });
}

for (const [input, reason] of [
  ["", "empty"],
  ["ahmed-zaki", "not_linkedin"],
  ["my profile", "not_linkedin"],
  ["https://facebook.com/ahmed", "not_linkedin"],
  ["https://linkedin.com.evil.com/in/ahmed", "not_linkedin"],
  ["https://notlinkedin.com/in/ahmed", "not_linkedin"],
  ["https://linkedin.com@evil.com/in/ahmed", "not_linkedin"],
  ["https://www.linkedin.com/company/meska-ai", "not_profile"],
  ["https://www.linkedin.com/posts/ahmed-zaki_ai-activity-123", "not_profile"],
  ["https://www.linkedin.com/feed/", "not_profile"],
  ["https://www.linkedin.com/in/", "not_profile"],
  ["https://www.linkedin.com/pub/dir/ahmed/zaki", "not_profile"],
]) {
  test(`rejects LinkedIn "${input}" as ${reason}`, () => {
    const result = parseLinkedIn(input);
    assert.equal(result.ok, false);
    assert.equal(result.reason, reason);
  });
}

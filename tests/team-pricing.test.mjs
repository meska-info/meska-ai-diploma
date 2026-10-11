import assert from "node:assert/strict";
import test from "node:test";
import {
  cartPermalink,
  clampSeats,
  nextTier,
  pricePerSeat,
  savingsFor,
  tierFor,
  totalFor,
} from "../app/lib/teamPricing.ts";

const canonical = [
  [1, 30_000, 30_000, 0],
  [2, 24_000, 48_000, 12_000],
  [3, 24_000, 72_000, 18_000],
  [4, 24_000, 96_000, 24_000],
  [5, 22_500, 112_500, 37_500],
  [6, 22_500, 135_000, 45_000],
  [7, 22_500, 157_500, 52_500],
  [8, 22_500, 180_000, 60_000],
  [10, 22_500, 225_000, 75_000],
  [15, 22_500, 337_500, 112_500],
  [20, 22_500, 450_000, 150_000],
];

for (const [seats, perSeat, total, saved] of canonical) {
  test(`prices ${seats} seat(s)`, () => {
    assert.equal(pricePerSeat(seats), perSeat);
    assert.equal(totalFor(seats), total);
    assert.equal(savingsFor(seats), saved);
  });
}

test("reports the next team tier", () => {
  assert.deepEqual(nextTier(1), {
    seatsNeeded: 1,
    newPricePerSeat: 24_000,
    extraSavingOnCurrentSeats: 6_000,
  });
  assert.deepEqual(nextTier(3), {
    seatsNeeded: 2,
    newPricePerSeat: 22_500,
    extraSavingOnCurrentSeats: 4_500,
  });
  assert.deepEqual(nextTier(4), {
    seatsNeeded: 1,
    newPricePerSeat: 22_500,
    extraSavingOnCurrentSeats: 6_000,
  });
  assert.equal(nextTier(5), null);
});

test("clamps arbitrary seat inputs", () => {
  assert.equal(clampSeats("x"), 1);
  assert.equal(clampSeats(0), 1);
  assert.equal(clampSeats(3.9), 3);
  assert.equal(clampSeats(99), 20);
  assert.equal(tierFor(4).key, "team20");
  assert.equal(tierFor(5).key, "team25");
});

test("builds the Shopify cart permalink without replacing attribution", () => {
  const url = new URL(cartPermalink(3, {
    leadId: "10cf1884-8042-4374-b70c-0f1badb77532",
    attribution: { utm_source: "meta", ref: "wrong", fbclid: "abc 123" },
  }));
  assert.equal(url.origin, "https://aionline.meska.ai");
  assert.equal(url.pathname, "/cart/42776902369326:3");
  assert.equal(url.searchParams.get("attributes[lead_id]"), "10cf1884-8042-4374-b70c-0f1badb77532");
  assert.equal(url.searchParams.get("ref"), "copilot-lp");
  assert.equal(url.searchParams.get("utm_source"), "meta");
  assert.equal(url.searchParams.get("fbclid"), "abc 123");
});

export const COPILOT_VARIANT_ID = "42776902369326";
export const BASE_PRICE = 30_000;
export const MIN_TEAM_SEATS = 2;
export const MAX_ONLINE_SEATS = 20;

export const TIERS = [
  { minSeats: 5, rate: 0.25, key: "team25" },
  { minSeats: 2, rate: 0.2, key: "team20" },
  { minSeats: 1, rate: 0, key: "individual" },
] as const;

export type PricingTier = (typeof TIERS)[number];

export function clampSeats(value: unknown) {
  const parsed = Math.floor(Number(value));
  if (!Number.isFinite(parsed) || parsed <= 0) return 1;
  return Math.min(parsed, MAX_ONLINE_SEATS);
}

export function tierFor(value: unknown): PricingTier {
  const seats = clampSeats(value);
  return TIERS.find((tier) => seats >= tier.minSeats) ?? TIERS.at(-1)!;
}

export function pricePerSeat(value: unknown) {
  return Math.round(BASE_PRICE * (1 - tierFor(value).rate));
}

export function totalFor(value: unknown) {
  const seats = clampSeats(value);
  return seats * pricePerSeat(seats);
}

export function savingsFor(value: unknown) {
  const seats = clampSeats(value);
  return seats * BASE_PRICE - totalFor(seats);
}

export function nextTier(value: unknown): {
  seatsNeeded: number;
  newPricePerSeat: number;
  extraSavingOnCurrentSeats: number;
} | null {
  const seats = clampSeats(value);
  if (seats >= 5) return null;
  if (seats === 1) {
    return {
      seatsNeeded: 1,
      newPricePerSeat: 24_000,
      extraSavingOnCurrentSeats: 6_000,
    };
  }
  return {
    seatsNeeded: 5 - seats,
    newPricePerSeat: 22_500,
    extraSavingOnCurrentSeats: seats * 1_500,
  };
}

export function formatEGP(value: number) {
  return `EGP ${Math.round(value).toLocaleString("en-US")}`;
}

export function cartPermalink(
  value: unknown,
  options: {
    leadId?: string | null;
    attribution?: Record<string, string> | null;
  } = {},
) {
  const seats = clampSeats(value);
  const url = new URL(
    `https://aionline.meska.ai/cart/${COPILOT_VARIANT_ID}:${seats}`,
  );
  if (options.leadId) {
    url.searchParams.set("attributes[lead_id]", options.leadId);
  }
  url.searchParams.set("ref", "copilot-lp");
  Object.entries(options.attribution ?? {}).forEach(([key, value]) => {
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value);
  });
  return url.toString();
}

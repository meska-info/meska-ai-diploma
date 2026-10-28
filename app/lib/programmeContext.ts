/**
 * Single source of truth for the programme facts stored with each lead.
 *
 * The lead API used to compare the posted price/wave/date with constants
 * hard-coded in the route, so a content change without a route change
 * rejected every lead. The route now resolves the facts from app/content.ts
 * (passed in as `diplomas`) and never rejects a lead because of a mismatch:
 * the authoritative content values are stored and the mismatch is reported
 * as `content_drift` for the daily pipeline-health check.
 */

export type ProgrammeFacts = {
  price: string;
  priceValue: number;
  wave: string;
  startDate: string;
};

export type PostedProgramme = {
  programmePrice: string;
  programmePriceValue: number;
  currentWave: string;
  currentWaveStartDate: string;
  leadMagnet: string;
};

export type ProgrammeResolution = {
  facts: ProgrammeFacts;
  leadMagnet: string;
  drift: Array<{ field: string; posted: string; expected: string }>;
};

export function resolveProgrammeContext(
  diplomas: Record<string, ProgrammeFacts>,
  diplomaSlug: string,
  posted: PostedProgramme,
  allowedLeadMagnets: readonly string[],
): ProgrammeResolution | null {
  const diploma = diplomas[diplomaSlug];
  if (!diploma) return null;

  const facts: ProgrammeFacts = {
    price: diploma.price,
    priceValue: diploma.priceValue,
    wave: diploma.wave,
    startDate: diploma.startDate,
  };
  const drift: ProgrammeResolution["drift"] = [];
  const compare = (field: string, postedValue: unknown, expected: unknown) => {
    if (postedValue !== expected) {
      drift.push({
        field,
        posted: String(postedValue ?? "").slice(0, 80),
        expected: String(expected),
      });
    }
  };
  compare("programmePrice", posted.programmePrice, facts.price);
  compare("programmePriceValue", posted.programmePriceValue, facts.priceValue);
  compare("currentWave", posted.currentWave, facts.wave);
  compare("currentWaveStartDate", posted.currentWaveStartDate, facts.startDate);

  let leadMagnet = posted.leadMagnet;
  if (!allowedLeadMagnets.includes(leadMagnet)) {
    compare("leadMagnet", posted.leadMagnet, allowedLeadMagnets[0]);
    leadMagnet = allowedLeadMagnets[0];
  }

  return { facts, leadMagnet, drift };
}

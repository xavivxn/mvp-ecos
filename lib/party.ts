import type { Candidate } from "@/lib/types";

export const PARTY_ORDER = ["ANR", "PLRA", "PEN", "YOCREOCDN"] as const;

export type PartyGroup = {
  party: string;
  abbr: string;
  color: string;
  members: Candidate[];
};

export function partyAbbr(party: string) {
  return party.split("(")[1]?.replace(")", "") ?? party;
}

function partyRank(abbr: string) {
  const index = PARTY_ORDER.indexOf(abbr as (typeof PARTY_ORDER)[number]);
  return index === -1 ? PARTY_ORDER.length : index;
}

export function groupCandidatesByParty(candidates: Candidate[]): PartyGroup[] {
  const map = new Map<string, PartyGroup>();

  for (const candidate of candidates) {
    const existing = map.get(candidate.party);
    if (existing) {
      existing.members.push(candidate);
      continue;
    }
    map.set(candidate.party, {
      party: candidate.party,
      abbr: partyAbbr(candidate.party),
      color: candidate.color,
      members: [candidate],
    });
  }

  return [...map.values()].sort((a, b) => partyRank(a.abbr) - partyRank(b.abbr));
}

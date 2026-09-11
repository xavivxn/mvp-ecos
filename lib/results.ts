import { cache } from "react";
import { rpc } from "@/lib/db";
import { normalizeHourlyActivity } from "@/lib/pulse";
import { getElection } from "@/lib/survey";
import type { Candidate, ChoiceCount, Election, RawResults } from "@/lib/types";

const SPECIAL: Record<string, { name: string; party: string; color: string }> = {
  blanco: { name: "Voto en blanco", party: "Opción especial", color: "#C4B8A5" },
};

export type RankedChoice = {
  id: string;
  name: string;
  party: string;
  color: string;
  photoUrl: string | null;
  votes: number;
  pct: number;
  isSpecial: boolean;
};

export type BoardData = {
  election: Election;
  candidates: Candidate[];
  totalVotes: number;
  votesLast24h: number;
  lastVoteAt: string | null;
  hourlyActivity: number[];
  uniqueVoters: number;
  padronSize: number;
  sessionsStarted: number;
  sessionsCompleted: number;
  uniqueVisitors: number;
  pageViews: number;
  conversion: number;
  intendente: RankedChoice[];
  concejal: RankedChoice[];
  leadIntendente: { leader: RankedChoice | null; margin: number };
  leadConcejal: { leader: RankedChoice | null; margin: number };
  generatedAt: string;
};

function rank(counts: ChoiceCount[], candidates: Candidate[], race: Candidate["race"], total: number): RankedChoice[] {
  const map = new Map(counts.map((c) => [c.choice, c.votes]));
  const rows: RankedChoice[] = candidates
    .filter((c) => c.race === race)
    .map((c) => {
      const votes = map.get(c.id) ?? 0;
      return {
        id: c.id,
        name: c.name,
        party: c.party,
        color: c.color,
        photoUrl: c.photoUrl,
        votes,
        pct: total ? (votes / total) * 100 : 0,
        isSpecial: false,
      };
    });

  for (const key of ["blanco"] as const) {
    rows.push({
      id: key,
      name: SPECIAL[key].name,
      party: SPECIAL[key].party,
      color: SPECIAL[key].color,
      photoUrl: null,
      votes: map.get(key) ?? 0,
      pct: total ? ((map.get(key) ?? 0) / total) * 100 : 0,
      isSpecial: true,
    });
  }

  return rows.sort((a, b) => b.votes - a.votes || a.name.localeCompare(b.name, "es"));
}

export const JUNTA_SEATS = 12;

export function competitionPlace(rows: RankedChoice[], index: number) {
  const votes = rows[index]?.votes ?? 0;
  return rows.filter((row) => row.votes > votes).length + 1;
}

export type TieGroup = {
  place: number;
  votes: number;
  rows: RankedChoice[];
};

export function tieGroups(rows: RankedChoice[]): TieGroup[] {
  const regular = rows.filter((row) => !row.isSpecial);
  const groups: TieGroup[] = [];
  let i = 0;
  while (i < regular.length) {
    const votes = regular[i]?.votes ?? 0;
    let end = i + 1;
    while (end < regular.length && regular[end]?.votes === votes) end += 1;
    if (votes > 0 && end - i >= 2) {
      groups.push({
        place: competitionPlace(regular, i),
        votes,
        rows: regular.slice(i, end),
      });
    }
    i = end;
  }
  return groups;
}

export function tiedChoiceIds(groups: TieGroup[]) {
  return new Set(groups.flatMap((group) => group.rows.map((row) => row.id)));
}

export function firstPlaceTiedWith(groups: TieGroup[], leaderId?: string | null) {
  const top = groups.find((group) => group.place === 1);
  if (!top || !leaderId) return [] as RankedChoice[];
  return top.rows.filter((row) => row.id !== leaderId);
}

export function splitJunta(regular: RankedChoice[], seats = JUNTA_SEATS) {
  if (regular.length <= seats) {
    return { inJunta: regular, outJunta: [] as RankedChoice[], tiedAtCut: false };
  }

  const cutVotes = regular[seats - 1]?.votes ?? 0;
  const next = regular[seats];
  const tiedAtCut = Boolean(next && next.votes === cutVotes && cutVotes > 0);
  let end = seats;
  if (tiedAtCut) {
    while (end < regular.length && regular[end]?.votes === cutVotes) {
      end += 1;
    }
  }

  return {
    inJunta: regular.slice(0, end),
    outJunta: regular.slice(end),
    tiedAtCut,
  };
}

export function sortCandidatesByVotes(candidates: Candidate[], counts: ChoiceCount[]): Candidate[] {
  const map = new Map(counts.map((c) => [c.choice, c.votes]));
  return [...candidates].sort(
    (a, b) => (map.get(b.id) ?? 0) - (map.get(a.id) ?? 0) || a.sortOrder - b.sortOrder,
  );
}

function lead(rows: RankedChoice[]) {
  const regular = rows.filter((r) => !r.isSpecial);
  const leader = regular[0] ?? null;
  const second = regular[1];
  return {
    leader,
    margin: leader && second ? leader.pct - second.pct : leader?.pct ?? 0,
  };
}

export const getBoard = cache(async function getBoard(): Promise<BoardData | null> {
  const election = await getElection();
  if (!election) return null;

  const [candidates, raw] = await Promise.all([
    rpc<Candidate[]>("app_list_candidates", { p_election_id: election.id }),
    rpc<RawResults>("app_get_results", { p_election_id: election.id }),
  ]);

  const intendente = rank(raw.intendente ?? [], candidates, "intendente", raw.totalVotes);
  const concejal = rank(raw.concejal ?? [], candidates, "concejal_lista", raw.totalVotes);

  return {
    election,
    candidates,
    totalVotes: raw.totalVotes,
    votesLast24h: raw.votesLast24h,
    lastVoteAt: typeof raw.lastVoteAt === "string" ? raw.lastVoteAt : raw.lastVoteAt ? String(raw.lastVoteAt) : null,
    hourlyActivity: normalizeHourlyActivity(raw.hourlyActivity),
    uniqueVoters: raw.uniqueVoters ?? 0,
    padronSize: raw.padronSize ?? 0,
    sessionsStarted: raw.sessionsStarted ?? 0,
    sessionsCompleted: raw.sessionsCompleted ?? 0,
    uniqueVisitors: raw.uniqueVisitors,
    pageViews: raw.pageViews,
    conversion: raw.uniqueVisitors ? (raw.totalVotes / raw.uniqueVisitors) * 100 : 0,
    intendente,
    concejal,
    leadIntendente: lead(intendente),
    leadConcejal: lead(concejal),
    generatedAt: new Date().toISOString(),
  };
});

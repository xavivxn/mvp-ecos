import { rpc } from "@/lib/db";
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
  uniqueVisitors: number;
  pageViews: number;
  conversion: number;
  intendente: RankedChoice[];
  concejal: RankedChoice[];
  leadIntendente: { leader: RankedChoice | null; margin: number };
  leadConcejal: { leader: RankedChoice | null; margin: number };
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

export async function getBoard(): Promise<BoardData | null> {
  const election = await rpc<Election | null>("app_get_active_election");
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
    uniqueVisitors: raw.uniqueVisitors,
    pageViews: raw.pageViews,
    conversion: raw.uniqueVisitors ? (raw.totalVotes / raw.uniqueVisitors) * 100 : 0,
    intendente,
    concejal,
    leadIntendente: lead(intendente),
    leadConcejal: lead(concejal),
  };
}

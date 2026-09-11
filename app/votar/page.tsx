import { VoteWizard } from "@/components/VoteWizard";
import { rpc } from "@/lib/db";
import { env } from "@/lib/env";
import { sortCandidatesByVotes } from "@/lib/results";
import { getElection } from "@/lib/survey";
import type { Candidate, RawResults } from "@/lib/types";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function VotarPage() {
  const election = await getElection();
  const [candidates, raw] = election
    ? await Promise.all([
        rpc<Candidate[]>("app_list_candidates", { p_election_id: election.id }),
        rpc<RawResults>("app_get_results", { p_election_id: election.id }),
      ])
    : [[] as Candidate[], null];
  const jar = await cookies();
  const allowRepeatVotes = env.allowRepeatVotes;
  const intendentes = sortCandidatesByVotes(
    candidates.filter((c) => c.race === "intendente"),
    raw?.intendente ?? [],
  );
  const concejales = sortCandidatesByVotes(
    candidates.filter((c) => c.race === "concejal_lista"),
    raw?.concejal ?? [],
  );

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <VoteWizard
        intendentes={intendentes}
        concejales={concejales}
        turnstileSiteKey={env.turnstileSiteKey}
        alreadyVoted={!allowRepeatVotes && jar.get("ecos_voted")?.value === "1"}
        allowRepeatVotes={allowRepeatVotes}
        isOpen={election?.isOpen ?? false}
      />
    </div>
  );
}

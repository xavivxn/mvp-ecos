import { VoteWizard } from "@/components/VoteWizard";
import { rpc } from "@/lib/db";
import type { Candidate, Election } from "@/lib/types";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function VotarPage() {
  const election = await rpc<Election | null>("app_get_active_election");
  const candidates = election
    ? await rpc<Candidate[]>("app_list_candidates", { p_election_id: election.id })
    : [];
  const jar = await cookies();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <VoteWizard
        intendentes={candidates.filter((c) => c.race === "intendente")}
        concejales={candidates.filter((c) => c.race === "concejal_lista")}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || ""}
        alreadyVoted={jar.get("ecos_voted")?.value === "1"}
        isOpen={election?.isOpen ?? false}
      />
    </div>
  );
}

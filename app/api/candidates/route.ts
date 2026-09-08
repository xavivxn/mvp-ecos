import { rpc } from "@/lib/db";
import type { Candidate, Election } from "@/lib/types";

export const runtime = "nodejs";

export async function GET() {
  const election = await rpc<Election | null>("app_get_active_election");
  if (!election) {
    return Response.json({ ok: false, error: "Sin elección activa." }, { status: 503 });
  }

  const candidates = await rpc<Candidate[]>("app_list_candidates", {
    p_election_id: election.id,
  });

  return Response.json({
    ok: true,
    election,
    intendentes: candidates.filter((c) => c.race === "intendente"),
    concejales: candidates.filter((c) => c.race === "concejal_lista"),
  });
}

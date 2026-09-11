import { cache } from "react";
import { rpc } from "@/lib/db";
import { env } from "@/lib/env";
import type { Election } from "@/lib/types";

export function withClosedOverride(election: Election): Election {
  if (!env.forceSurveyClosed) return election;
  return { ...election, isOpen: false };
}

export const getElection = cache(async function getElection() {
  const election = await rpc<Election | null>("app_get_active_election");
  return election ? withClosedOverride(election) : null;
});

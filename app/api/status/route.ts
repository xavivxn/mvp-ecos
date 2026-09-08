import { cookies } from "next/headers";
import { rpc } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const jar = await cookies();
  const election = await rpc<{ isOpen: boolean } | null>("app_get_active_election");
  return Response.json({
    ok: true,
    hasVoted: jar.get("ecos_voted")?.value === "1",
    isOpen: election?.isOpen ?? false,
  });
}

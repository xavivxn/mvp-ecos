import { CloseStickyCta } from "@/components/CloseChrome";
import { env } from "@/lib/env";
import { getElection } from "@/lib/survey";

export async function StickyCta() {
  const election = await getElection();
  const preview = env.previewCloseCountdown;
  if (!election || (!election.isOpen && !preview)) return null;

  return <CloseStickyCta closesAt={election.closesAt} preview={preview} />;
}

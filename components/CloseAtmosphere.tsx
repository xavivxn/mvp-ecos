import { CloseAtmosphereGlow } from "@/components/CloseChrome";
import { env } from "@/lib/env";
import { getElection } from "@/lib/survey";

export async function CloseAtmosphere() {
  const election = await getElection();
  const preview = env.previewCloseCountdown;
  if (!election) return null;

  return (
    <CloseAtmosphereGlow
      closesAt={election.closesAt}
      preview={preview}
      closed={!election.isOpen && !preview}
    />
  );
}

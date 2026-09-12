import { SurveyPhaseWatcher } from "@/components/SurveyPhaseWatcher";
import { env } from "@/lib/env";
import { isClosingWindow, msUntil } from "@/lib/pulse";
import { getElection } from "@/lib/survey";

export async function PhaseGate() {
  const election = await getElection();
  const remaining = election ? msUntil(election.closesAt) : 0;
  const preview = env.previewCloseCountdown;
  const open = Boolean(election?.isOpen) || preview;

  return (
    <SurveyPhaseWatcher
      initiallyOpen={open}
      initiallyClosing={preview || (Boolean(election?.isOpen) && isClosingWindow(remaining))}
      disabled={preview}
    />
  );
}

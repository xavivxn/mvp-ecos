import { SurveyPhaseWatcher } from "@/components/SurveyPhaseWatcher";
import { isClosingWindow, msUntil } from "@/lib/pulse";
import { getElection } from "@/lib/survey";

export async function PhaseGate() {
  const election = await getElection();
  const remaining = election ? msUntil(election.closesAt) : 0;
  const open = Boolean(election?.isOpen);

  return (
    <SurveyPhaseWatcher
      initiallyOpen={open}
      initiallyClosing={open && isClosingWindow(remaining)}
    />
  );
}

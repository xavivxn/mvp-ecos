import { Check } from "lucide-react";
import { CandidatePhoto } from "./CandidatePhoto";
import { partySurface } from "@/lib/color";
import type { Candidate } from "@/lib/types";

export function CandidateCard({
  candidate,
  selected,
  onSelect,
  hideParty = false,
}: {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
  hideParty?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className="flex min-h-20 w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition"
      style={partySurface(candidate.color, selected)}
    >
      <CandidatePhoto
        src={candidate.photoUrl}
        name={candidate.name}
        color={candidate.color}
        size={candidate.photoUrl ? 64 : 40}
        className="sm:!h-20 sm:!w-20"
      />
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block font-medium leading-tight [overflow-wrap:anywhere]">{candidate.name}</span>
        {hideParty ? null : (
          <span className="block text-sm font-medium [overflow-wrap:anywhere]" style={{ color: candidate.color }}>
            {candidate.party}
          </span>
        )}
      </span>
      <span
        className="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2"
        style={
          selected
            ? { borderColor: candidate.color, background: candidate.color, color: "#fff" }
            : { borderColor: candidate.color }
        }
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

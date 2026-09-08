import { Check } from "lucide-react";
import type { Candidate } from "@/lib/types";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export function CandidateCard({
  candidate,
  selected,
  onSelect,
}: {
  candidate: Candidate;
  selected: boolean;
  onSelect: () => void;
}) {
  const listBadge = candidate.race === "concejal_lista" ? candidate.name : null;

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
        selected
          ? "border-brand bg-brand-soft"
          : "border-line bg-bg hover:border-brand/40"
      }`}
    >
      <span
        className="grid h-11 w-11 shrink-0 place-items-center rounded-lg text-sm font-semibold text-white"
        style={{ background: candidate.color }}
      >
        {initials(candidate.name)}
      </span>
      <span className="min-w-0 flex-1">
        {listBadge ? (
          <>
            <span className="chip mb-1 bg-surface-2 mono text-[10px] uppercase tracking-wider text-muted">
              {listBadge}
            </span>
            <span className="block font-medium leading-tight">{candidate.party}</span>
          </>
        ) : (
          <>
            <span className="block font-medium leading-tight">{candidate.name}</span>
            <span className="block text-sm text-muted">{candidate.party}</span>
          </>
        )}
      </span>
      <span
        className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
          selected ? "border-brand bg-brand text-on-brand" : "border-line"
        }`}
      >
        {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
      </span>
    </button>
  );
}

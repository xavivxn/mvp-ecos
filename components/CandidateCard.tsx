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
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${
        selected
          ? "border-gold bg-gold/10 glow-ring"
          : "border-line bg-ink-2/60 hover:border-gold/40"
      }`}
    >
      <span
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full text-sm font-semibold text-cream"
        style={{ background: candidate.color }}
      >
        {initials(candidate.name)}
      </span>
      <span className="min-w-0">
        <span className="block font-medium leading-tight">{candidate.name}</span>
        <span className="block text-sm text-cream-dim">{candidate.party}</span>
      </span>
      <span
        className={`ml-auto h-5 w-5 rounded-full border ${selected ? "border-gold bg-gold" : "border-cream-dim"}`}
      />
    </button>
  );
}

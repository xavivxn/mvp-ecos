import { ChevronRight } from "lucide-react";
import { partySurface } from "@/lib/color";

export function PartyCard({
  abbr,
  party,
  color,
  count,
  onSelect,
}: {
  abbr: string;
  party: string;
  color: string;
  count: number;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className="flex min-h-20 w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition"
      style={partySurface(color)}
    >
      <span className="h-12 w-1.5 shrink-0 rounded-full" style={{ background: color }} aria-hidden />
      <span className="min-w-0 flex-1 overflow-hidden">
        <span className="block font-semibold leading-tight [overflow-wrap:anywhere]">{abbr}</span>
        <span className="block text-sm font-medium [overflow-wrap:anywhere]" style={{ color }}>
          {party}
        </span>
        <span className="mt-0.5 block text-xs text-muted">
          {count} {count === 1 ? "candidato" : "candidatos"}
        </span>
      </span>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted" aria-hidden />
    </button>
  );
}
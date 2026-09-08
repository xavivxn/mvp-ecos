import { Check, Minus } from "lucide-react";

export function SpecialChoice({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left ${
        selected ? "border-brand bg-brand-soft" : "border-dashed border-line bg-transparent"
      }`}
    >
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-surface-2 text-muted">
        <Minus className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium">Voto en blanco</span>
        <span className="block text-sm text-muted">Registrás participación sin elegir candidato.</span>
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

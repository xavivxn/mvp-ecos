export function SpecialChoice({
  kind,
  selected,
  onSelect,
}: {
  kind: "blanco" | "nulo";
  selected: boolean;
  onSelect: () => void;
}) {
  const label = kind === "blanco" ? "Voto en blanco" : "Voto nulo";
  const hint =
    kind === "blanco"
      ? "Registrás participación sin elegir candidato."
      : "Se cuenta por separado, no suma a ninguna lista.";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`min-h-16 w-full rounded-2xl border px-4 py-3 text-left ${
        selected ? "border-gold bg-gold/10" : "border-dashed border-line bg-transparent"
      }`}
    >
      <span className="block font-medium">{label}</span>
      <span className="block text-sm text-cream-dim">{hint}</span>
    </button>
  );
}

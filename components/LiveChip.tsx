export function LiveChip({ label = "En vivo" }: { label?: string }) {
  return (
    <span className="chip bg-brand-soft text-brand-strong">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
      </span>
      <span className="mono">{label}</span>
    </span>
  );
}

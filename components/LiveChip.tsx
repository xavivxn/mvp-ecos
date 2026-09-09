export function LiveChip({
  label = "En vivo",
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={`chip bg-brand-soft text-brand-strong ${
        compact ? "max-sm:gap-0 max-sm:px-1.5 max-sm:py-1.5" : ""
      }`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-60" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand" />
      </span>
      <span className={`mono ${compact ? "max-sm:sr-only" : ""}`}>{label}</span>
    </span>
  );
}

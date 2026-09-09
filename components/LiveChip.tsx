export function LiveChip({
  label = "En vivo",
  compact = false,
  hot = false,
}: {
  label?: string;
  compact?: boolean;
  hot?: boolean;
}) {
  return (
    <span
      className={`chip ${
        hot ? "bg-brand text-on-brand" : "bg-brand-soft text-brand-strong"
      } ${compact ? "max-sm:gap-0 max-sm:px-1.5 max-sm:py-1.5" : ""}`}
    >
      <span className={`relative flex shrink-0 ${hot ? "h-2 w-2" : "h-1.5 w-1.5"}`}>
        <span
          className={`absolute inline-flex h-full w-full animate-ping rounded-full ${
            hot ? "bg-on-brand opacity-80" : "bg-brand opacity-60"
          }`}
        />
        <span
          className={`relative inline-flex rounded-full ${
            hot ? "h-2 w-2 bg-on-brand" : "h-1.5 w-1.5 bg-brand"
          }`}
        />
      </span>
      <span className={`mono ${compact ? "max-sm:sr-only" : ""}`}>{label}</span>
    </span>
  );
}

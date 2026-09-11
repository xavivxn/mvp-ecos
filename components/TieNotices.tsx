export function PlaceMark({ place, tied = false }: { place?: number; tied?: boolean }) {
  if (!place) return null;
  return (
    <div className="flex w-8 shrink-0 flex-col items-center gap-0.5">
      <span className="mono text-sm text-muted">{place}°</span>
      {tied ? (
        <span className="mono text-[9px] uppercase tracking-[0.12em] text-muted">Empate</span>
      ) : null}
    </div>
  );
}

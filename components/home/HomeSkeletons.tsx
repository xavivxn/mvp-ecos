import { Skeleton } from "@/components/Skeleton";

export function SparklineSkeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex h-8 min-w-0 items-end gap-px overflow-hidden sm:h-12 ${className}`}
      aria-hidden
    >
      {Array.from({ length: 24 }, (_, i) => (
        <div
          key={i}
          className="min-w-0 flex-1 overflow-hidden rounded-sm"
          style={{ height: `${18 + ((i * 13) % 72)}%` }}
        >
          <Skeleton className="h-full w-full rounded-sm" />
        </div>
      ))}
    </div>
  );
}

export function LiveCardSkeleton() {
  return (
    <aside className="card min-w-0 overflow-hidden p-4 sm:p-5" aria-busy="true" aria-label="Cargando tablero en vivo">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-3 w-40" />
      <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="flex flex-col items-center rounded-xl border border-line px-1 py-2">
            <Skeleton className="h-12 w-12 rounded-full sm:h-16 sm:w-16" />
            <Skeleton className="mt-2 h-3 w-14" />
            <Skeleton className="mt-1 h-3 w-10" />
          </div>
        ))}
      </div>
      <div className="mt-5 space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-10" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
      <SparklineSkeleton className="mt-5" />
    </aside>
  );
}

export function HomeKpisSkeleton({ className = "mt-10" }: { className?: string }) {
  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`} aria-busy="true" aria-label="Cargando indicadores">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="card min-w-0 p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-8 w-16" />
          <Skeleton className="mt-2 h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

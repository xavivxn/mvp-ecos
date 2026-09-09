import { Skeleton } from "@/components/Skeleton";

function RaceSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-7 w-36" />
      <div className="rounded-2xl border-2 border-line p-5">
        <Skeleton className="h-6 w-28 rounded-full" />
        <div className="mt-4 flex items-center gap-4">
          <Skeleton className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-28" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="mt-2 h-4 w-1/2" />
            <Skeleton className="mt-3 h-12 w-28" />
            <Skeleton className="mt-2 h-4 w-40" />
          </div>
        </div>
      </div>
      <div className="card space-y-5 p-5">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="space-y-2 rounded-xl border border-line p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
                <div>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ResultadosLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8" aria-busy="true" aria-label="Cargando resultados">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="mt-3 h-9 w-72 sm:h-10" />
      <Skeleton className="mt-3 h-12 w-full max-w-xl" />
      <div className="mt-8 space-y-6">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Skeleton className="h-6 w-16 shrink-0 rounded-full" />
          <Skeleton className="hidden h-3 w-40 sm:block sm:min-w-0 sm:flex-1" />
          <Skeleton className="ml-auto h-3 w-32 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface p-1 lg:hidden">
          <Skeleton className="h-10 rounded-lg" />
          <Skeleton className="h-10 rounded-lg" />
        </div>
        <div className="hidden gap-8 lg:grid lg:grid-cols-2">
          <RaceSkeleton />
          <RaceSkeleton />
        </div>
        <div className="lg:hidden">
          <RaceSkeleton />
        </div>
      </div>
    </div>
  );
}

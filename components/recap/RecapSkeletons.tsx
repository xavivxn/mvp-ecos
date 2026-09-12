import { Skeleton } from "@/components/Skeleton";
import { HomeKpisSkeleton } from "@/components/home/HomeSkeletons";

function LeadHeroSkeleton() {
  return (
    <div className="rounded-2xl border-2 border-line p-4 sm:p-6">
      <Skeleton className="h-6 w-36 rounded-full" />
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
  );
}

function RaceRowsSkeleton({ count }: { count: number }) {
  return (
    <div className="card space-y-4 p-5">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="space-y-2 rounded-xl border-2 border-line p-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full sm:h-12 sm:w-12" />
              <div>
                <Skeleton className="h-4 w-32" />
                <Skeleton className="mt-2 h-3 w-24" />
              </div>
            </div>
            <div className="shrink-0">
              <Skeleton className="ml-auto h-5 w-12" />
              <Skeleton className="mt-2 ml-auto h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function RecapIntendenteSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-8 w-40" />
      <LeadHeroSkeleton />
      <RaceRowsSkeleton count={4} />
    </section>
  );
}

function RecapConcejalSkeleton() {
  return (
    <section className="space-y-4">
      <Skeleton className="h-8 w-36" />
      <Skeleton className="h-4 w-full max-w-xl" />
      <LeadHeroSkeleton />
      <RaceRowsSkeleton count={6} />
    </section>
  );
}

function RecapNumbersSkeleton() {
  return (
    <section className="space-y-5">
      <div>
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-8 w-64 sm:h-9" />
      </div>
      <div className="card flex items-start gap-3 border-2 border-line p-5">
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
        <div className="min-w-0 flex-1">
          <Skeleton className="h-5 w-64 max-w-full" />
          <Skeleton className="mt-2 h-4 w-48 max-w-full" />
        </div>
      </div>
      <HomeKpisSkeleton className="mt-0" />
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="card p-4">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-7 w-16" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </div>
    </section>
  );
}

function RecapHowItWorksSkeleton() {
  return (
    <section>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-2 h-8 w-48 sm:h-9" />
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }, (_, i) => (
          <article key={i} className="card p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-3 w-8" />
            </div>
            <Skeleton className="mt-4 h-5 w-28" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-1 h-4 w-3/4" />
          </article>
        ))}
      </div>
    </section>
  );
}

function RecapStorySkeleton() {
  return (
    <section className="space-y-10">
      <div>
        <Skeleton className="h-3 w-36" />
        <Skeleton className="mt-2 h-8 w-56 sm:h-9" />
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <article key={i} className="card flex gap-3 p-5">
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1">
                <Skeleton className="h-5 w-40 max-w-full" />
                <Skeleton className="mt-2 h-4 w-full" />
                <Skeleton className="mt-1 h-4 w-5/6" />
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="card bg-surface p-6 sm:p-8">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-8 w-40" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-1 h-4 w-5/6 max-w-xl" />
      </div>
      <div className="card border-2 border-line p-6 sm:p-8">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="mt-2 h-8 w-72 max-w-full sm:h-9" />
        <Skeleton className="mt-3 h-4 w-full max-w-2xl" />
        <Skeleton className="mt-1 h-4 w-4/5 max-w-xl" />
      </div>
    </section>
  );
}

export function RecapHomeSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando el acta">
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <Skeleton className="h-7 w-40 rounded-full" />
        <Skeleton className="mt-4 h-10 w-full max-w-md sm:h-12" />
        <Skeleton className="mt-3 h-10 w-72 max-w-full sm:h-12" />
        <Skeleton className="mt-4 h-4 w-full max-w-xl" />
        <Skeleton className="mt-2 h-4 w-5/6 max-w-lg" />
        <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        <Skeleton className="mt-7 h-12 w-44 rounded-xl" />
      </section>

      <div className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
          <RecapIntendenteSkeleton />
          <RecapConcejalSkeleton />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
        <RecapNumbersSkeleton />
        <RecapHowItWorksSkeleton />
        <RecapStorySkeleton />
        <div className="flex justify-center pb-4">
          <Skeleton className="h-12 w-44 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

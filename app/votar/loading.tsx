import { Skeleton } from "@/components/Skeleton";

export default function VotarLoading() {
  return (
    <div className="mx-auto max-w-xl px-4 py-8" aria-busy="true" aria-label="Cargando votación">
      <ol className="mb-8 flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <li key={i} className="flex flex-1 flex-col items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </li>
        ))}
      </ol>
      <Skeleton className="h-8 w-56 sm:h-9" />
      <Skeleton className="mt-3 h-12 w-full max-w-md" />
      <div className="mt-6 space-y-5">
        <div>
          <Skeleton className="mb-2 h-4 w-32" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div>
          <Skeleton className="mb-2 h-4 w-40" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

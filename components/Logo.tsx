import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex min-h-11 items-center gap-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-on-brand" aria-hidden>
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 14c4-7 12-8 14-3-4 1-7 4-8 8-3-2-5-4-6-5Z"
            fill="currentColor"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-tight">Ecos</span>
        {compact ? null : (
          <span className="mono hidden text-[10px] uppercase tracking-[0.14em] text-muted sm:block">
            Yaguarón
          </span>
        )}
      </span>
    </Link>
  );
}

import Link from "next/link";
import { Logo } from "./Logo";
import { LiveChip } from "./LiveChip";
import { CloseHeaderRule, CloseVoteLink } from "./CloseChrome";
import { env } from "@/lib/env";
import { getElection } from "@/lib/survey";

export async function SiteHeader() {
  const election = await getElection();
  const preview = env.previewCloseCountdown;
  const closed = Boolean(election && !election.isOpen && !preview);

  return (
    <header className="relative sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md @container/chrome">
      <div className="mx-auto grid h-14 max-w-5xl grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-1.5 px-3 sm:gap-2 sm:px-4">
        <div className="min-w-0 justify-self-start">
          <Logo />
        </div>
        <div className="flex min-w-0 justify-center">
          <Link
            href={closed ? "/" : "/resultados"}
            aria-label={closed ? "Acta de cierre" : "Resultados en vivo"}
            className="btn-secondary h-10! min-h-10! max-w-full min-w-0 gap-1.5 px-2! text-sm sm:gap-2 sm:px-4!"
          >
            {closed ? (
              <span className="chip bg-surface-2 text-muted max-sm:gap-0 max-sm:px-1.5 max-sm:py-1.5">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
                <span className="mono max-sm:sr-only">Cerrada</span>
              </span>
            ) : (
              <LiveChip compact />
            )}
            <span className="truncate">{closed ? "Acta" : "Resultados"}</span>
          </Link>
        </div>
        <nav className="flex shrink-0 items-center justify-end gap-1 sm:gap-1.5">
          <Link href="/#como-funciona" className="btn-ghost hidden text-sm md:inline-flex">
            Cómo funciona
          </Link>
          {closed ? (
            <Link
              href="/#intendencia"
              className="btn-primary h-10! min-h-10! px-2.5! text-sm sm:px-4!"
            >
              Resumen
            </Link>
          ) : (
            <CloseVoteLink
              href="/votar"
              closesAt={election?.closesAt}
              preview={preview}
              className="btn-primary h-10! min-h-10! shrink-0 px-2.5! text-sm sm:px-3! md:px-4!"
              idleLabel="Votar"
            />
          )}
        </nav>
      </div>
      {!closed ? <CloseHeaderRule closesAt={election?.closesAt} preview={preview} /> : null}
    </header>
  );
}

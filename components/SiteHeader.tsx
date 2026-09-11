import Link from "next/link";
import { Logo } from "./Logo";
import { LiveChip } from "./LiveChip";
import { getElection } from "@/lib/survey";

export async function SiteHeader() {
  const election = await getElection();
  const closed = Boolean(election && !election.isOpen);

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto grid h-14 max-w-5xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-4">
        <div className="min-w-0 justify-self-start">
          <Logo />
        </div>
        <Link
          href="/resultados"
          aria-label={closed ? "Resultado final" : "Resultados en vivo"}
          className="btn-secondary h-10 min-h-10 gap-1.5 whitespace-nowrap px-2 text-sm sm:gap-2 sm:px-4"
        >
          {closed ? (
            <span className="chip bg-surface-2 text-muted max-sm:gap-0 max-sm:px-1.5 max-sm:py-1.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted" />
              <span className="mono max-sm:sr-only">Cerrada</span>
            </span>
          ) : (
            <LiveChip compact />
          )}
          Resultados
        </Link>
        <nav className="flex min-w-0 items-center justify-end gap-1 sm:gap-1.5">
          <Link
            href={closed ? "/#tecnica" : "/#como-funciona"}
            className="btn-ghost hidden text-sm md:inline-flex"
          >
            Cómo funciona
          </Link>
          {closed ? (
            <Link href="/" className="btn-primary h-10 min-h-10 whitespace-nowrap px-3 text-sm sm:px-4">
              Resumen
            </Link>
          ) : (
            <Link href="/votar" className="btn-primary h-10 min-h-10 whitespace-nowrap px-3 text-sm sm:px-4">
              Votar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

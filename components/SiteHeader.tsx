import Link from "next/link";
import { Logo } from "./Logo";
import { LiveChip } from "./LiveChip";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1.5">
          <Link
            href="/#como-funciona"
            className="btn-ghost hidden text-sm md:inline-flex"
          >
            Cómo funciona
          </Link>
          <Link
            href="/resultados"
            className="btn-secondary h-10 min-h-10 gap-2 px-2.5 text-sm sm:px-4"
          >
            <LiveChip />
            Resultados
          </Link>
          <Link href="/votar" className="btn-primary h-10 min-h-10 px-3 text-sm sm:px-4">
            Votar
          </Link>
        </nav>
      </div>
    </header>
  );
}

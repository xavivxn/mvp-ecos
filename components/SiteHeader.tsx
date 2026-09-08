import Link from "next/link";
import { Logo } from "./Logo";
import { LiveChip } from "./LiveChip";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Logo />
        <nav className="flex items-center gap-1">
          <Link
            href="/#como-funciona"
            className="btn-ghost hidden text-sm md:inline-flex"
          >
            Cómo funciona
          </Link>
          <Link href="/resultados" className="btn-ghost hidden text-sm sm:inline-flex">
            Resultados
          </Link>
          <span className="hidden sm:inline-flex">
            <LiveChip />
          </span>
          <Link href="/votar" className="btn-primary h-10 px-4 text-sm">
            Votar
          </Link>
        </nav>
      </div>
    </header>
  );
}

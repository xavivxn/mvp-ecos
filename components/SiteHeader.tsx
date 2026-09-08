import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 min-h-11">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gold text-ink font-display font-semibold">
            E
          </span>
          <span className="font-display text-xl tracking-tight">Ecos</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link
            href="/votar"
            className="min-h-11 rounded-full px-4 py-2 text-cream-dim hover:text-cream"
          >
            Votar
          </Link>
          <Link
            href="/resultados"
            className="min-h-11 rounded-full px-4 py-2 text-cream-dim hover:text-cream"
          >
            Resultados
          </Link>
        </nav>
      </div>
    </header>
  );
}

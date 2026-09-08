import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-5xl gap-8 px-4 py-10 text-sm md:grid-cols-3">
        <div>
          <p className="font-semibold tracking-tight">Ecos</p>
          <p className="mt-2 text-muted">
            Proyecto ciudadano independiente, hecho en Yaguarón.
          </p>
        </div>
        <div>
          <p className="font-semibold">Transparencia</p>
          <ul className="mt-2 space-y-1 text-muted">
            <li>
              <Link href="/#como-funciona" className="hover:text-ink">
                Cómo funciona
              </Link>
            </li>
            <li>
              <Link href="/#transparencia" className="hover:text-ink">
                Qué guardamos
              </Link>
            </li>
            <li>
              <Link href="/resultados" className="hover:text-ink">
                Resultados en vivo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Aviso</p>
          <p className="mt-2 text-muted">
            No es un cómputo oficial del TSJE. Las Elecciones Municipales 2026 se
            celebran el 4 de octubre.
          </p>
        </div>
      </div>
    </footer>
  );
}

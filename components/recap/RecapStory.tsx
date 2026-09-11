import { KeyRound, Lock, Landmark, ShieldCheck } from "lucide-react";
import { GITHUB_REPO_URL } from "@/lib/site";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.52 2.87 8.35 6.84 9.71.5.1.68-.22.68-.49 0-.24-.01-.87-.01-1.71-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.86.09-.67.35-1.12.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.27 2.75 1.05a9.3 9.3 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.95.68 1.92 0 1.38-.01 2.49-.01 2.83 0 .27.18.6.69.49A10.04 10.04 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

const ITEMS = [
  {
    title: "SHA-256 con clave (HMAC)",
    body: "La cédula y la fecha de nacimiento se guardan como un hash HMAC-SHA256. En la base no aparece el documento en texto plano.",
    icon: KeyRound,
  },
  {
    title: "Voto separado de la persona",
    body: "El hash vive en un registro. La boleta, en otra tabla, sin cédula. Nadie puede ver qué eligió quién.",
    icon: Lock,
  },
  {
    title: "Padrón de Yaguarón",
    body: "Antes de votar contrastamos cédula y fecha contra el padrón del distrito, también por hash. Si no figura, no hay voto.",
    icon: Landmark,
  },
  {
    title: "Un documento, un voto",
    body: "La base bloquea el segundo intento con el mismo documento. El acta de arriba muestra que las personas coinciden con las boletas.",
    icon: ShieldCheck,
  },
];

export function RecapStory() {
  return (
    <section id="tecnica" className="scroll-mt-20 space-y-10">
      <div>
        <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">Cómo se cuidó el dato</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Qué guardamos, y qué no
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <article key={item.title} className="card flex gap-3 p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <item.icon className="h-4 w-4" />
              </span>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm text-muted">{item.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div id="autor" className="card bg-surface p-6 sm:p-8">
        <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">Quién lo hizo</p>
        <div className="mt-2 flex items-center gap-3">
          <h2 className="text-2xl font-semibold tracking-tight">Iván Ortiz</h2>
          {GITHUB_REPO_URL ? (
            <a
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Código en GitHub"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <GitHubIcon className="h-5 w-5" />
            </a>
          ) : null}
        </div>
        <p className="mt-3 max-w-2xl text-muted">
          Estudiante de Ingeniería Informática (Yaguarón). Ecos nació como iniciativa
          propia: una prueba de encriptación enfocada en ciberseguridad, para mejorar y
          aprender habilidades. Un voto por persona, secreto, y hashes en lugar de documentos.
        </p>
      </div>

      <div id="gracias" className="card border-2 border-brand p-6 sm:p-8">
        <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">Gracias</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Por participar y confiar.
        </h2>
        <p className="mt-3 max-w-2xl text-muted">
          Cada voto fue secreto y contó una sola vez. Gracias a quienes se tomaron el tiempo
          de verificar el padrón y cargar su intención.
        </p>
        <p className="mt-6 max-w-2xl text-muted">
          Acá se midió una intención, con un voto por persona y en secreto. El 4 de octubre
          toca lo mismo, pero de verdad: ir, votar, y dejar que el pueblo decida.
        </p>
      </div>
    </section>
  );
}

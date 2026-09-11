import { KeyRound, Lock, Landmark, ShieldCheck } from "lucide-react";

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
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Iván Ortiz</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Estudiante de Ingeniería Informática de Yaguarón. Ecos nació como iniciativa
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
          de verificar el padrón y cargar su intención: sin eso, Ecos no existía.
        </p>
        <p className="mt-6 max-w-2xl text-muted">
          Acá se midió una intención, con un voto por persona y en secreto. El 4 de octubre
          toca lo mismo, pero de verdad: ir, votar, y dejar que el pueblo decida.
        </p>
      </div>
    </section>
  );
}

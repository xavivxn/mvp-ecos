import { IdCard, Vote, ChartColumn } from "lucide-react";

const STEPS = [
  {
    n: "01",
    title: "Verificás",
    body: "Ingresás tu cédula y fecha de nacimiento. Las contrastamos con el padrón de Yaguarón y no guardamos el número en texto plano.",
    icon: IdCard,
  },
  {
    n: "02",
    title: "Elegís",
    body: "Intendencia y concejalía. También podés votar en blanco.",
    icon: Vote,
  },
  {
    n: "03",
    title: "Ves resultados",
    closedTitle: "Ves el acta",
    body: "El tablero se actualiza en vivo. Una cédula, un voto. El voto es secreto.",
    closedBody: "El acta queda fijada. Una cédula, un voto. El voto es secreto.",
    icon: ChartColumn,
  },
];

export function HowItWorks({ final = false }: { final?: boolean }) {
  return (
    <section id="como-funciona" className="scroll-mt-20">
      <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">Cómo funciona</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {final ? "Cómo se votó" : "Tres pasos, sin vueltas"}
      </h2>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {STEPS.map((step) => (
          <article key={step.n} className="card p-5">
            <div className="flex items-center justify-between">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-soft text-brand-strong">
                <step.icon className="h-4 w-4" />
              </span>
              <span className="mono text-xs text-muted">{step.n}</span>
            </div>
            <h3 className="mt-4 font-semibold">
              {final && step.closedTitle ? step.closedTitle : step.title}
            </h3>
            <p className="mt-2 text-sm text-muted">
              {final && step.closedBody ? step.closedBody : step.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

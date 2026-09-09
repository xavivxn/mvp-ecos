import { ShieldCheck, Lock, Landmark, BarChart3 } from "lucide-react";

const ITEMS = [
  {
    title: "Una cédula, un voto",
    body: "La base de datos bloquea el segundo intento. No hay forma de votar dos veces con el mismo documento.",
    icon: ShieldCheck,
  },
  {
    title: "Voto secreto",
    body: "El hash de tu cédula vive separado del voto. Nadie puede ver qué eligió quién.",
    icon: Lock,
  },
  {
    title: "Padrón de Yaguarón",
    body: "Antes de votar contrastamos cédula y fecha de nacimiento con el padrón oficial del distrito. Si no figura, no se registra el voto.",
    icon: Landmark,
  },
  {
    title: "Métricas abiertas",
    body: "El tablero es público: porcentajes en vivo. Sin cédulas a la vista.",
    icon: BarChart3,
  },
];

export function Transparency() {
  return (
    <section id="transparencia" className="scroll-mt-20">
      <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">Transparencia</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Qué guardamos, y qué no</h2>
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
    </section>
  );
}

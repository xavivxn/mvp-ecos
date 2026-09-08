import Link from "next/link";
import { getBoard } from "@/lib/results";
import { LiveCard } from "@/components/home/LiveCard";
import { HowItWorks } from "@/components/home/HowItWorks";
import { Transparency } from "@/components/home/Transparency";
import { AboutProject } from "@/components/home/AboutProject";
import { StickyCta } from "@/components/home/StickyCta";
import { CountUp } from "@/components/CountUp";

export const dynamic = "force-dynamic";

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default async function HomePage() {
  const board = await getBoard();
  const closesAt = board?.election.closesAt ?? "2026-10-04T23:59:59-03:00";

  return (
    <div className="pb-24 md:pb-0">
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <div className="grid items-start gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="chip bg-brand-soft text-brand-strong">
              <span className="mono">Elecciones Municipales 2026 · Yaguarón</span>
            </p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              El pulso de Yaguarón, en números.
            </h1>
            <p className="mt-4 max-w-lg text-muted">
              Ecos es una herramienta ciudadana de intención de voto. Validamos cédula contra el
              padrón, un voto por persona, y mostramos quién va liderando.
            </p>
            <div className="mt-7 hidden gap-3 sm:flex">
              <Link href="/votar" className="btn-primary">
                Cargar mi voto
              </Link>
              <Link href="/resultados" className="btn-secondary">
                Ver resultados
              </Link>
            </div>
          </div>
          <LiveCard board={board} />
        </div>

        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Votos", board?.totalVotes ?? 0, ""],
            ["Últimas 24 h", board?.votesLast24h ?? 0, ""],
            ["Visitantes", board?.uniqueVisitors ?? 0, ""],
            ["Cierra en", daysUntil(closesAt), " días"],
          ].map(([label, value, suffix]) => (
            <div key={String(label)} className="card p-4">
              <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight">
                <CountUp value={Number(value)} suffix={String(suffix)} />
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
          <HowItWorks />
          <Transparency />
          <AboutProject />
        </div>
      </div>
      <StickyCta />
    </div>
  );
}

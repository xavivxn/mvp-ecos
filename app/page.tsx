import Link from "next/link";
import { Countdown } from "@/components/Countdown";
import { getBoard } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const board = await getBoard();
  const leader = board?.leadIntendente.leader;
  const electionEnd = board?.election.closesAt ?? "2026-10-04T23:59:59-03:00";

  return (
    <div className="grain">
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-10">
        <p className="text-sm uppercase tracking-[0.22em] text-gold">Municipales 2026</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight sm:text-6xl">
          ¿Quién va liderando en tu ciudad?
        </h1>
        <p className="mt-4 max-w-xl text-lg text-cream-dim">
          Ecos es una urna digital de intención de voto. Validamos cédula contra el padrón, un voto
          por persona, y mostramos el pulso en vivo.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/votar"
            className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-6 font-semibold text-ink"
          >
            Cargar mi voto
          </Link>
          <Link
            href="/resultados"
            className="inline-flex h-12 items-center justify-center rounded-full border border-line px-6"
          >
            Ver resultados
          </Link>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-line bg-ink-2/60 p-5">
            <p className="text-sm text-cream-dim">Cierre de la encuesta</p>
            <div className="mt-4">
              <Countdown target={electionEnd} />
            </div>
          </div>
          <div className="rounded-3xl border border-line bg-ink-2/60 p-5">
            <p className="text-sm text-cream-dim">Intendencia ahora</p>
            {leader && board && board.totalVotes > 0 ? (
              <>
                <h2 className="mt-3 font-display text-3xl">{leader.name}</h2>
                <p className="mt-1 text-cream-dim">{leader.party}</p>
                <p className="mt-4 text-gold">
                  {board.leadIntendente.margin < 0.05
                    ? `${leader.pct.toFixed(1)}% · empate en la cima`
                    : `${leader.pct.toFixed(1)}% · ventaja de ${board.leadIntendente.margin.toFixed(1)} pts`}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-3 font-display text-3xl">Todavía nadie</h2>
                <p className="mt-1 text-cream-dim">Sé de los primeros en dejar tu intención de voto.</p>
              </>
            )}
            <p className="mt-6 text-sm text-cream-dim">
              {board?.totalVotes ?? 0} votos · {board?.uniqueVisitors ?? 0} visitantes
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

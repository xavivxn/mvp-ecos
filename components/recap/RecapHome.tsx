import { RecapConcejal, RecapIntendente } from "@/components/recap/RecapRace";
import { RecapBeacon } from "@/components/recap/RecapBeacon";
import { RecapNumbers } from "@/components/recap/RecapNumbers";
import { RecapShare } from "@/components/recap/RecapShare";
import { RecapStory } from "@/components/recap/RecapStory";
import { HowItWorks } from "@/components/home/HowItWorks";
import { formatPyDate } from "@/lib/format";
import type { BoardData } from "@/lib/results";

export function RecapHome({ board }: { board: BoardData }) {
  const from = formatPyDate(board.election.opensAt);
  const to = formatPyDate(board.election.closesAt);

  return (
    <div>
      <RecapBeacon />
      <section className="mx-auto max-w-5xl px-4 pb-12 pt-10">
        <p className="chip bg-surface-2 text-muted">
          <span className="mono">Encuesta cerrada</span>
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
          Así cerró Ecos en {board.election.city}.
        </h1>
        <p className="mt-4 max-w-xl text-muted">
          Del {from} al {to}. Resultado final de la encuesta ciudadana. Gracias a quienes
          participaron y confiaron su voto acá.
        </p>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Encuesta no oficial, muestra autoseleccionada. No es un cómputo del TSJE: las
          Elecciones Municipales 2026 se celebran el 4 de octubre.
        </p>
        <div className="mt-7">
          <RecapShare />
        </div>
      </section>

      <div className="bg-surface">
        <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
          <RecapIntendente board={board} />
          <RecapConcejal board={board} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl space-y-14 px-4 py-14">
        <RecapNumbers board={board} />
        <HowItWorks final />
        <RecapStory />
        <div className="flex justify-center pb-4">
          <RecapShare />
        </div>
      </div>
    </div>
  );
}

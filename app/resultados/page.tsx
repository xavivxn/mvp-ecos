import { ResultsBoard } from "@/components/ResultsBoard";
import { getBoard } from "@/lib/results";

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const board = await getBoard();

  if (!board) {
    return (
      <section className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Sin datos todavía</h1>
        <p className="mt-3 text-cream-dim">No hay una elección activa configurada.</p>
      </section>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <p className="text-sm uppercase tracking-[0.22em] text-gold">{board.election.city}</p>
      <h1 className="mt-2 font-display text-4xl">{board.election.name}</h1>
      <p className="mt-3 max-w-2xl text-cream-dim">
        Resultados agregados en vivo. El voto es secreto: acá no aparece ninguna cédula.
      </p>
      <div className="mt-8">
        <ResultsBoard initial={board} />
      </div>
    </div>
  );
}

import { Check } from "lucide-react";
import { formatInt, formatPct, formatPyDateTime } from "@/lib/format";
import type { BoardData } from "@/lib/results";

export function RecapNumbers({ board }: { board: BoardData }) {
  const personas = board.uniqueVoters;
  const boletas = board.totalVotes;
  const same = personas === boletas;
  const padronPct = board.padronSize ? (personas / board.padronSize) * 100 : 0;
  const verifyPct = board.sessionsStarted
    ? (board.sessionsCompleted / board.sessionsStarted) * 100
    : 0;

  return (
    <section id="pulso" className="scroll-mt-20 space-y-5">
      <div>
        <p className="mono text-xs uppercase tracking-[0.16em] text-brand-strong">El pulso</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
          Números de la encuesta
        </h2>
      </div>

      <div
        className={`card flex items-start gap-3 border-2 p-5 ${
          same ? "border-brand" : "border-danger"
        }`}
      >
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
            same ? "bg-brand-soft text-brand-strong" : "bg-danger-soft text-danger"
          }`}
        >
          <Check className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0">
          <p className="font-semibold">
            {same
              ? "Un documento, un voto. No hubo doble carga."
              : "Las personas y las boletas no coinciden."}
          </p>
          <p className="mt-1 text-sm text-muted">
            {formatInt(personas)} personas que decidieron votar
            {same ? " = " : " ≠ "}
            {formatInt(boletas)} boletas generadas.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Personas", value: formatInt(personas), hint: "quienes cargaron su voto" },
          { label: "Boletas", value: formatInt(boletas), hint: "una por persona" },
          {
            label: "Del padrón",
            value: formatPct(padronPct),
            hint: `${formatInt(board.padronSize)} electores`,
          },
          {
            label: "Visita → voto",
            value: formatPct(board.conversion),
            hint: `${formatInt(board.uniqueVisitors)} visitantes`,
          },
        ].map((stat) => (
          <div key={stat.label} className="card min-w-0 p-4">
            <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
            <p className="mt-1 truncate text-xs text-muted">{stat.hint}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card p-4">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">Visitantes</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{formatInt(board.uniqueVisitors)}</p>
          <p className="mt-1 text-xs text-muted">{formatInt(board.pageViews)} páginas vistas</p>
        </div>
        <div className="card p-4">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">Verificación</p>
          <p className="mt-2 text-xl font-semibold tabular-nums">{formatPct(verifyPct, 0)}</p>
          <p className="mt-1 text-xs text-muted">
            {formatInt(board.sessionsCompleted)} de {formatInt(board.sessionsStarted)} llegaron al voto
          </p>
        </div>
        <div className="card p-4">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">Último voto</p>
          <p className="mt-2 text-sm font-semibold">
            {board.lastVoteAt ? formatPyDateTime(board.lastVoteAt) : "Sin votos"}
          </p>
          <p className="mt-1 text-xs text-muted">Hora de Paraguay</p>
        </div>
      </div>
    </section>
  );
}

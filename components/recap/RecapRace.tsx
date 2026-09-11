import { CandidatePhoto } from "@/components/CandidatePhoto";
import { LeadHero } from "@/components/LeadHero";
import { RestAccordion } from "@/components/RestAccordion";
import { partySurface } from "@/lib/color";
import { cssPct } from "@/lib/pulse";
import { formatInt, formatPct } from "@/lib/format";
import type { BoardData, RankedChoice } from "@/lib/results";
import { competitionPlace, JUNTA_SEATS, splitJunta } from "@/lib/results";

function Row({
  row,
  max,
  place,
  muted = false,
}: {
  row: RankedChoice;
  max: number;
  place?: number;
  muted?: boolean;
}) {
  const width = max ? Math.max(4, (row.votes / max) * 100) : 4;
  return (
    <div
      className={`min-w-0 space-y-2 overflow-hidden rounded-xl border-2 p-3 ${muted ? "opacity-70" : ""}`}
      style={partySurface(row.color, place === 1 && !row.isSpecial)}
    >
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {place ? <span className="mono w-6 shrink-0 text-sm text-muted">{place}°</span> : null}
          <CandidatePhoto src={row.photoUrl} name={row.name} color={row.color} size={row.photoUrl ? 48 : 36} />
          <div className="min-w-0">
            <p className="font-medium leading-tight [overflow-wrap:anywhere]">{row.name}</p>
            <p className="text-xs [overflow-wrap:anywhere] sm:text-sm" style={{ color: row.color }}>
              {row.party}
            </p>
          </div>
        </div>
        <p className="mono shrink-0 text-right">
          <span className="block text-base sm:text-lg">{formatPct(row.pct)}</span>
          <span className="block text-[11px] text-muted">
            {formatInt(row.votes)} {row.votes === 1 ? "voto" : "votos"}
          </span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full"
          style={{ width: cssPct(width, 4), background: row.color }}
        />
      </div>
    </div>
  );
}

export function RecapIntendente({ board }: { board: BoardData }) {
  const regular = board.intendente.filter((r) => !r.isSpecial);
  const special = board.intendente.filter((r) => r.isSpecial);
  const max = Math.max(...board.intendente.map((r) => r.votes), 1);
  const challenger = regular[1] ?? null;

  return (
    <section id="intendencia" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Intendencia</h2>
      <LeadHero lead={board.leadIntendente} challenger={challenger} final showVotes />
      <div className="card space-y-4 p-5">
        {regular.map((row, index) => (
          <Row key={row.id} row={row} max={max} place={index + 1} />
        ))}
        {special.map((row) => (
          <Row key={row.id} row={row} max={max} />
        ))}
      </div>
    </section>
  );
}

export function RecapConcejal({ board }: { board: BoardData }) {
  const regular = board.concejal.filter((r) => !r.isSpecial);
  const special = board.concejal.filter((r) => r.isSpecial);
  const { inJunta, outJunta, tiedAtCut } = splitJunta(regular, JUNTA_SEATS);
  const max = Math.max(...board.concejal.map((r) => r.votes), 1);
  const challenger = regular[1] ?? null;

  return (
    <section id="concejalía" className="scroll-mt-20 space-y-4">
      <h2 className="text-2xl font-semibold tracking-tight">Concejalía</h2>
      <p className="text-sm text-muted">
        {tiedAtCut
          ? `La Junta son ${JUNTA_SEATS}. Hay empate en el último lugar: esta encuesta no deja afuera a quien igualó, así que se muestran ${inJunta.length}.`
          : `Los ${JUNTA_SEATS} primeros, según esta encuesta, serían quienes ingresan a la Junta.`}
      </p>
      <LeadHero lead={board.leadConcejal} challenger={challenger} final showVotes />
      <div className="card space-y-4 p-5">
        {inJunta.map((row, index) => (
          <Row key={row.id} row={row} max={max} place={competitionPlace(regular, index)} />
        ))}
        <p className="mono text-center text-[11px] uppercase tracking-[0.14em] text-muted">
          {tiedAtCut
            ? `Empate en el ${JUNTA_SEATS}° · ingresarían ${inJunta.length}`
            : `Entran ${JUNTA_SEATS}`}
        </p>
        <RestAccordion label="Ver el resto de la lista" count={outJunta.length + special.length}>
          {outJunta.map((row, index) => (
            <Row
              key={row.id}
              row={row}
              max={max}
              place={competitionPlace(regular, inJunta.length + index)}
              muted
            />
          ))}
          {special.length ? (
            <div className="border-t border-line pt-4">
              <p className="mono mb-4 text-[11px] uppercase tracking-[0.14em] text-muted">
                Opciones especiales
              </p>
              <div className="space-y-4">
                {special.map((row) => (
                  <Row key={row.id} row={row} max={max} />
                ))}
              </div>
            </div>
          ) : null}
        </RestAccordion>
      </div>
    </section>
  );
}

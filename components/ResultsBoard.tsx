"use client";

import { useState } from "react";
import { CandidatePhoto } from "./CandidatePhoto";
import { CloseUrgency } from "./CloseUrgency";
import { RestAccordion } from "./RestAccordion";
import { CountUp } from "./CountUp";
import { LeadHero } from "./LeadHero";
import { LiveChip } from "./LiveChip";
import { partySurface } from "@/lib/color";
import { boardNow, cssPct, formatLastVote, isPulseHot, showsCloseUrgency } from "@/lib/pulse";
import { useResultsPoll } from "@/lib/useResultsPoll";
import { useCloseRemaining } from "@/lib/usePreviewClose";
import type { BoardData, RankedChoice } from "@/lib/results";
import { competitionPlace, splitJunta } from "@/lib/results";

function Bar({ row, max, place, final = false }: { row: RankedChoice; max: number; place?: number; final?: boolean }) {
  const width = max ? Math.max(4, (row.votes / max) * 100) : 4;
  const first = place === 1 && !row.isSpecial;
  return (
    <div
      className={`min-w-0 space-y-2 overflow-hidden rounded-xl border-2 p-3 ${first && !final ? "leader-glow" : ""}`}
      style={partySurface(row.color, first)}
    >
      <div className="flex items-start justify-between gap-2 sm:items-center sm:gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {place ? (
            <span className="mono w-6 shrink-0 text-sm text-muted">{place}°</span>
          ) : null}
          <CandidatePhoto src={row.photoUrl} name={row.name} color={row.color} size={row.photoUrl ? 48 : 36} />
          <div className="min-w-0">
            <p className="font-medium leading-tight [overflow-wrap:anywhere]">{row.name}</p>
            <p className="text-xs [overflow-wrap:anywhere] sm:text-sm" style={{ color: row.color }}>{row.party}</p>
          </div>
        </div>
        <p className={`mono shrink-0 ${first ? "text-xl font-semibold sm:text-2xl" : "text-base sm:text-lg"}`}>
          <CountUp value={row.pct} digits={1} suffix="%" />
        </p>
      </div>
      <div className={`overflow-hidden rounded-full bg-surface-2 ${first ? "h-3" : "h-2"}`}>
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: cssPct(width, 4), background: row.color }}
        />
      </div>
    </div>
  );
}

function Race({
  title,
  rows,
  lead,
  cutoff,
  final = false,
}: {
  title: string;
  rows: RankedChoice[];
  lead: BoardData["leadIntendente"];
  cutoff?: number;
  final?: boolean;
}) {
  const regular = rows.filter((r) => !r.isSpecial);
  const special = rows.filter((r) => r.isSpecial);
  const max = Math.max(...rows.map((r) => r.votes), 1);
  const challenger = regular[1] ?? null;
  const split = cutoff ? splitJunta(regular, cutoff) : null;
  const shown = split ? split.inJunta : regular;
  const hidden = split ? split.outJunta : [];

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {split?.tiedAtCut ? (
        <p className="text-sm text-muted">
          Empate en el {cutoff}°: no dejamos afuera a quien igualó. Se muestran {shown.length}.
        </p>
      ) : null}
      <LeadHero lead={lead} challenger={challenger} final={final} />
      <div className="card space-y-5 p-5">
        {shown.map((row, index) => (
          <Bar
            key={row.id}
            row={row}
            max={max}
            place={competitionPlace(regular, index)}
            final={final}
          />
        ))}
        {cutoff ? (
          <>
            {hidden.length || split?.tiedAtCut ? (
              <p className="mono text-center text-[11px] uppercase tracking-[0.14em] text-muted">
                {split?.tiedAtCut
                  ? `Empate en el ${cutoff}° · ingresarían ${shown.length}`
                  : `Entran ${cutoff}`}
              </p>
            ) : null}
            <RestAccordion
              label="Ver el resto de la lista"
              count={hidden.length + special.length}
            >
              {hidden.map((row, index) => (
                <Bar
                  key={row.id}
                  row={row}
                  max={max}
                  place={competitionPlace(regular, shown.length + index)}
                  final={final}
                />
              ))}
              {special.length ? (
                <div className="border-t border-line pt-4">
                  <p className="mono mb-4 text-[11px] uppercase tracking-[0.14em] text-muted">
                    Opciones especiales
                  </p>
                  <div className="space-y-5">
                    {special.map((row) => (
                      <Bar key={row.id} row={row} max={max} />
                    ))}
                  </div>
                </div>
              ) : null}
            </RestAccordion>
          </>
        ) : (
          <div className="border-t border-line pt-4">
            <p className="mono mb-4 text-[11px] uppercase tracking-[0.14em] text-muted">
              Opciones especiales
            </p>
            <div className="space-y-5">
              {special.map((row) => (
                <Bar key={row.id} row={row} max={max} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

export function ResultsBoard({
  initial,
  final = false,
  previewCloseCountdown = false,
}: {
  initial: BoardData;
  final?: boolean;
  previewCloseCountdown?: boolean;
}) {
  const { board: live, age } = useResultsPoll(initial, !final);
  const board = live ?? initial;
  const [tab, setTab] = useState<"intendente" | "concejal">("intendente");
  const now = boardNow(board.generatedAt, age);
  const hot = !final && isPulseHot(board.lastVoteAt, now);
  const remaining = useCloseRemaining(board.election.closesAt, previewCloseCountdown);
  const closing = !final && showsCloseUrgency(remaining, previewCloseCountdown);

  return (
    <div className="space-y-6">
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        {final ? (
          <span className="chip bg-surface-2 text-muted">
            <span className="mono">Resultado final</span>
          </span>
        ) : (
          <LiveChip hot={hot} />
        )}
        {final ? (
          <p className="mono min-w-0 truncate text-xs text-muted">Encuesta cerrada</p>
        ) : closing ? (
          <>
            <CloseUrgency
              closesAt={board.election.closesAt}
              remaining={remaining}
              preview={previewCloseCountdown}
              className="min-w-0 flex-1 text-[11px] sm:text-xs"
            />
            <span className="hidden text-muted/50 sm:inline" aria-hidden>
              ·
            </span>
            <p className="mono ml-auto shrink-0 text-xs text-muted" aria-live="polite">
              Actualizado hace {age}s
            </p>
          </>
        ) : (
          <>
            <p className="sr-only sm:not-sr-only sm:min-w-0 sm:flex-1 sm:truncate sm:text-xs sm:text-muted">
              <span className="mono">
                {hot ? "Se está votando ahora" : formatLastVote(board.lastVoteAt, now)}
              </span>
            </p>
            <span className="hidden text-muted/50 sm:inline" aria-hidden>
              ·
            </span>
            <p className="mono ml-auto shrink-0 text-xs text-muted" aria-live="polite">
              Actualizado hace {age}s
            </p>
          </>
        )}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setTab("intendente")}
          className={`h-10 rounded-lg text-sm font-medium ${
            tab === "intendente" ? "bg-bg shadow-sm" : "text-muted"
          }`}
        >
          Intendencia
        </button>
        <button
          type="button"
          onClick={() => setTab("concejal")}
          className={`h-10 rounded-lg text-sm font-medium ${
            tab === "concejal" ? "bg-bg shadow-sm" : "text-muted"
          }`}
        >
          Concejalía
        </button>
      </div>

      <div className="hidden gap-8 lg:grid lg:grid-cols-2">
        <Race title="Intendencia" rows={board.intendente} lead={board.leadIntendente} final={final} />
        <Race title="Concejalía" rows={board.concejal} lead={board.leadConcejal} cutoff={12} final={final} />
      </div>
      <div className="lg:hidden">
        {tab === "intendente" ? (
          <Race title="Intendencia" rows={board.intendente} lead={board.leadIntendente} final={final} />
        ) : (
          <Race title="Concejalía" rows={board.concejal} lead={board.leadConcejal} cutoff={12} final={final} />
        )}
      </div>

      <p className="text-center text-xs text-muted">
        Encuesta no oficial, muestra autoseleccionada. No es un cómputo del TSJE.
      </p>
    </div>
  );
}

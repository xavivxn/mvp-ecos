"use client";

import { useEffect, useRef, useState } from "react";
import { Trophy } from "lucide-react";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { CountUp } from "@/components/CountUp";
import { partySurface } from "@/lib/color";
import { formatEsList, formatInt, shortName } from "@/lib/format";
import type { BoardData, RankedChoice } from "@/lib/results";

export function LeadHero({
  lead,
  challenger,
  tiedWith = [],
  compact = false,
  final = false,
  showVotes = false,
}: {
  lead: BoardData["leadIntendente"];
  challenger?: RankedChoice | null;
  tiedWith?: RankedChoice[];
  compact?: boolean;
  final?: boolean;
  showVotes?: boolean;
}) {
  const leader = lead.leader;
  const [flash, setFlash] = useState(false);
  const prevId = useRef<string | undefined>(leader?.id);
  const tied = tiedWith.length > 0;

  useEffect(() => {
    const id = leader?.id;
    if (id && prevId.current && id !== prevId.current) {
      setFlash(true);
      const timer = window.setTimeout(() => setFlash(false), 700);
      prevId.current = id;
      return () => window.clearTimeout(timer);
    }
    prevId.current = id;
  }, [leader?.id]);

  if (!leader || leader.votes <= 0) return null;

  const photo = compact ? 64 : 96;
  const rival = challenger && !challenger.isSpecial ? shortName(challenger.name) : null;
  const tiedNames = formatEsList(tiedWith.map((row) => shortName(row.name)));

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 p-4 sm:p-5 ${
        final ? "" : "leader-glow"
      } ${flash && !final ? "leader-flash" : ""} ${compact ? "" : "sm:p-6"}`}
      style={partySurface(leader.color, true)}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: leader.color }}
        aria-hidden
      />
      <div className="relative flex items-center gap-2">
        <span
          className="chip gap-1.5 text-white"
          style={{ background: leader.color }}
        >
          <Trophy className="h-3.5 w-3.5" aria-hidden />
          {final ? "Lideró la encuesta" : "Va liderando"}
        </span>
        {tied ? (
          <span className="mono text-[11px] uppercase tracking-[0.12em] text-muted">Empate</span>
        ) : null}
      </div>

      <div className={`relative mt-4 flex min-w-0 items-center ${compact ? "gap-3" : "gap-4"}`}>
        <span className="relative shrink-0">
          <span
            className="absolute -inset-1 rounded-2xl opacity-50 blur-md"
            style={{ background: leader.color }}
            aria-hidden
          />
          <CandidatePhoto
            src={leader.photoUrl}
            name={leader.name}
            color={leader.color}
            size={photo}
            className={`relative ring-2 ring-white/80 ${compact ? "sm:!h-16 sm:!w-16" : "sm:!h-28 sm:!w-28"}`}
          />
        </span>
        <div className="min-w-0 flex-1">
          <h3
            className={`font-semibold tracking-tight leading-tight [overflow-wrap:anywhere] ${
              compact ? "text-lg sm:text-xl" : "text-2xl sm:text-3xl"
            }`}
          >
            {leader.name}
          </h3>
          <p className="mt-0.5 text-sm text-muted [overflow-wrap:anywhere]">{leader.party}</p>
          <p
            className={`mt-2 font-semibold tabular-nums tracking-tight text-brand-strong ${
              compact ? "text-3xl" : "text-4xl sm:text-5xl"
            }`}
          >
            <CountUp value={leader.pct} digits={1} suffix="%" />
          </p>
          <p className="mt-1 text-sm font-medium text-brand-strong">
            {tied
              ? final
                ? `Empate en el 1°: empataron con ${tiedNames}`
                : `Empate en el 1° con ${tiedNames}`
              : rival
                ? (
                    <>
                      Le saca <CountUp value={lead.margin} digits={1} /> pts a {rival}
                    </>
                  )
                : (
                    <>
                      +<CountUp value={lead.margin} digits={1} /> pts de ventaja
                    </>
                  )}
          </p>
          {showVotes ? (
            <p className="mt-1 text-sm text-muted">
              {formatInt(leader.votes)} {leader.votes === 1 ? "voto" : "votos"}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

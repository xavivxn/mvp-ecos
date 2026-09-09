import { CountUp } from "@/components/CountUp";
import { boardNow, cssPct, daysUntil, surveyElapsedPct, todaySharePct } from "@/lib/pulse";
import type { BoardData } from "@/lib/results";

function shortName(name: string) {
  return name.replace(/^(Ing\.|Prof\.|Profe\.)\s+/i, "");
}

export function PulseKpis({
  board,
  now,
  className = "",
}: {
  board: BoardData | null;
  now?: number;
  className?: string;
}) {
  const opensAt = board?.election.opensAt ?? "2026-09-07T00:00:00-03:00";
  const closesAt = board?.election.closesAt ?? "2026-09-16T23:59:59-03:00";
  const hasVotes = Boolean(board && board.totalVotes > 0);
  const intendente = hasVotes ? board?.leadIntendente.leader : null;
  const concejal = hasVotes ? board?.leadConcejal.leader : null;
  const clock = now ?? boardNow(board?.generatedAt);
  const days = daysUntil(closesAt, clock || Date.parse(closesAt));
  const elapsed = surveyElapsedPct(opensAt, closesAt, clock || Date.parse(opensAt));
  const today = todaySharePct(board?.votesLast24h ?? 0, board?.totalVotes ?? 0);

  return (
    <div className={`grid grid-cols-2 gap-3 sm:grid-cols-4 ${className}`}>
      {[
        {
          label: "Intendencia",
          hint: intendente ? shortName(intendente.name) : "Quien lidera ahora",
          value: intendente?.pct ?? 0,
          digits: 1,
          suffix: "%",
          bar: null as number | null,
        },
        {
          label: "Concejalía",
          hint: concejal ? shortName(concejal.name) : "Quien lidera ahora",
          value: concejal?.pct ?? 0,
          digits: 1,
          suffix: "%",
          bar: null,
        },
        {
          label: "Hoy",
          hint: "de los votos de ahora",
          value: today,
          digits: 0,
          suffix: "%",
          bar: null,
        },
        {
          label: "Cierra en",
          hint: days === 0 ? "último tramo" : "para el cierre",
          value: days,
          digits: 0,
          suffix: days === 1 ? " día" : " días",
          bar: elapsed,
          today: days === 0,
        },
      ].map((stat) => (
        <div key={stat.label} className="card min-w-0 p-4">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            {"today" in stat && stat.today ? (
              "Hoy"
            ) : (
              <CountUp value={stat.value} digits={stat.digits} suffix={stat.suffix} />
            )}
          </p>
          {stat.bar != null ? (
            <>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-brand transition-[width] duration-700"
                  style={{ width: cssPct(stat.bar) }}
                />
              </div>
              <p className="mt-1 truncate text-xs text-muted">{stat.hint}</p>
            </>
          ) : (
            <p className="mt-1 truncate text-xs text-muted">{stat.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}

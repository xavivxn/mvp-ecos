import { CountUp } from "@/components/CountUp";
import { getBoard } from "@/lib/results";

function daysUntil(iso: string) {
  const diff = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function shortName(name: string) {
  return name.replace(/^(Ing\.|Prof\.|Profe\.)\s+/i, "");
}

function surveyElapsedPct(opensAt: string, closesAt: string) {
  const open = new Date(opensAt).getTime();
  const close = new Date(closesAt).getTime();
  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open) return 0;
  return Math.min(100, Math.max(0, ((Date.now() - open) / (close - open)) * 100));
}

export async function HomeKpis() {
  const board = await getBoard();
  const opensAt = board?.election.opensAt ?? new Date().toISOString();
  const closesAt = board?.election.closesAt ?? "2026-09-16T23:59:59-03:00";
  const hasVotes = Boolean(board && board.totalVotes > 0);
  const intendente = hasVotes ? board?.leadIntendente.leader : null;
  const concejal = hasVotes ? board?.leadConcejal.leader : null;
  const blanco = board?.intendente.find((row) => row.id === "blanco");

  return (
    <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        {
          label: "Intendencia",
          hint: intendente ? shortName(intendente.name) : "Quien lidera ahora",
          value: intendente?.pct ?? 0,
          digits: 1,
          suffix: "%",
        },
        {
          label: "Concejalía",
          hint: concejal ? shortName(concejal.name) : "Quien lidera ahora",
          value: concejal?.pct ?? 0,
          digits: 1,
          suffix: "%",
        },
        {
          label: "En blanco",
          hint: "Intendencia",
          value: blanco?.pct ?? 0,
          digits: 1,
          suffix: "%",
        },
        {
          label: "Recorrido",
          hint: `Cierra en ${daysUntil(closesAt)} días`,
          value: surveyElapsedPct(opensAt, closesAt),
          digits: 0,
          suffix: "%",
        },
      ].map((stat) => (
        <div key={stat.label} className="card min-w-0 p-4">
          <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">
            <CountUp value={stat.value} digits={stat.digits} suffix={stat.suffix} />
          </p>
          <p className="mt-1 truncate text-xs text-muted">{stat.hint}</p>
        </div>
      ))}
    </div>
  );
}

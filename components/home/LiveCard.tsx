import Link from "next/link";
import type { BoardData } from "@/lib/results";
import { LiveChip } from "@/components/LiveChip";

export function LiveCard({ board }: { board: BoardData | null }) {
  const leader = board?.leadIntendente.leader;
  const top = (board?.intendente ?? []).filter((r) => !r.isSpecial).slice(0, 3);
  const max = Math.max(...top.map((r) => r.votes), 1);
  const tied = leader && board && Math.abs(board.leadIntendente.margin) < 0.05 && board.totalVotes > 0;

  return (
    <aside className="card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">Intendencia ahora</p>
        <LiveChip />
      </div>

      {leader && board && board.totalVotes > 0 ? (
        <>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">{leader.name}</h2>
          <p className="text-sm text-muted">{leader.party}</p>
          <p className="mt-2 text-sm font-medium text-brand-strong">
            {tied
              ? `${leader.pct.toFixed(1)}% · empate en la cima`
              : `${leader.pct.toFixed(1)}% · +${board.leadIntendente.margin.toFixed(1)} pts`}
          </p>
          <div className="mt-5 space-y-3">
            {top.map((row) => (
              <div key={row.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="truncate pr-2">{row.name}</span>
                  <span className="mono text-muted">{row.pct.toFixed(1)}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(6, (row.votes / max) * 100)}%`,
                      background: row.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight">Todavía nadie</h2>
          <p className="mt-1 text-sm text-muted">Sé de las primeras personas en dejar tu intención de voto.</p>
        </>
      )}

      <p className="mt-5 text-xs text-muted">
        <span className="mono">{board?.totalVotes ?? 0}</span> votos ·{" "}
        <span className="mono">{board?.uniqueVisitors ?? 0}</span> visitantes
      </p>
      <Link href="/resultados" className="mt-3 inline-flex text-sm font-medium text-brand-strong">
        Ver el tablero →
      </Link>
    </aside>
  );
}

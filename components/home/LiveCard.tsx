import Link from "next/link";
import type { BoardData } from "@/lib/results";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { LiveChip } from "@/components/LiveChip";
import { partySurface } from "@/lib/color";

function shortName(name: string) {
  return name.replace(/^Ing\.\s+/i, "");
}

function partyTag(party: string) {
  return party.split("(")[1]?.replace(")", "") ?? party;
}

export function LiveCard({ board }: { board: BoardData | null }) {
  const leader = board?.leadIntendente.leader;
  const lineup = (board?.candidates ?? [])
    .filter((c) => c.race === "intendente")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const top = (board?.intendente ?? []).filter((r) => !r.isSpecial).slice(0, 3);
  const max = Math.max(...top.map((r) => r.votes), 1);
  const tied = leader && board && Math.abs(board.leadIntendente.margin) < 0.05 && board.totalVotes > 0;
  const hasVotes = Boolean(board && board.totalVotes > 0 && leader);

  return (
    <aside className="card min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-muted">Intendencia ahora</p>
        <LiveChip />
      </div>

      {lineup.length ? (
        <div className="mt-4 grid grid-cols-3 gap-1.5 sm:gap-2">
          {lineup.map((candidate) => (
            <div
              key={candidate.id}
              className="flex min-w-0 flex-col items-center overflow-hidden rounded-xl border-2 px-1 py-2 text-center sm:px-1.5"
              style={partySurface(candidate.color)}
            >
              <CandidatePhoto
                src={candidate.photoUrl}
                name={candidate.name}
                color={candidate.color}
                size={48}
                className="sm:!h-16 sm:!w-16"
              />
              <p className="mt-1.5 w-full text-[10px] font-medium leading-snug [overflow-wrap:anywhere] line-clamp-2 sm:text-xs">
                {shortName(candidate.name)}
              </p>
              <p className="mt-0.5 w-full truncate text-[10px] font-semibold sm:text-[11px]" style={{ color: candidate.color }}>
                {partyTag(candidate.party)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {hasVotes && leader && board ? (
        <>
          <div
            className="mt-5 flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border-2 p-2"
            style={partySurface(leader.color, true)}
          >
            <CandidatePhoto src={leader.photoUrl} name={leader.name} color={leader.color} size={48} />
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-semibold tracking-tight leading-tight [overflow-wrap:anywhere] sm:text-lg">
                {leader.name}
              </h2>
              <p className="text-xs text-muted [overflow-wrap:anywhere] sm:text-sm">{leader.party}</p>
              <p className="mt-1 text-sm font-medium text-brand-strong">
                {tied
                  ? `${leader.pct.toFixed(1)}% · empate en la cima`
                  : `${leader.pct.toFixed(1)}% · +${board.leadIntendente.margin.toFixed(1)} pts`}
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {top.map((row) => (
              <div key={row.id} className="min-w-0">
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex min-w-0 items-center gap-2">
                    <CandidatePhoto src={row.photoUrl} name={row.name} color={row.color} size={24} />
                    <span className="truncate">{shortName(row.name)}</span>
                  </span>
                  <span className="mono shrink-0 text-muted">{row.pct.toFixed(1)}%</span>
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
        <p className="mt-4 text-sm text-muted">Sé de las primeras personas en dejar tu intención de voto.</p>
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

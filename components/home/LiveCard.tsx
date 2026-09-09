import Link from "next/link";
import type { BoardData } from "@/lib/results";
import { ActivitySparkline } from "@/components/home/ActivitySparkline";
import { CandidatePhoto } from "@/components/CandidatePhoto";
import { CountUp } from "@/components/CountUp";
import { LiveChip } from "@/components/LiveChip";
import { partySurface } from "@/lib/color";
import { partyAbbr } from "@/lib/party";
import { formatLastVote, isPulseHot, cssPct } from "@/lib/pulse";

function shortName(name: string) {
  return name.replace(/^Ing\.\s+/i, "");
}

export function LiveCard({ board, now }: { board: BoardData | null; now?: number }) {
  const leader = board?.leadIntendente.leader;
  const lineup = (board?.candidates ?? [])
    .filter((c) => c.race === "intendente")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const top = (board?.intendente ?? []).filter((r) => !r.isSpecial).slice(0, 3);
  const max = Math.max(...top.map((r) => r.votes), 1);
  const tied = leader && board && Math.abs(board.leadIntendente.margin) < 0.05 && board.totalVotes > 0;
  const hasVotes = Boolean(board && board.totalVotes > 0 && leader);
  const hot = isPulseHot(board?.lastVoteAt, now);

  return (
    <aside className="card min-w-0 overflow-hidden p-4 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-sm text-muted">Intendencia ahora</p>
        <LiveChip hot={hot} />
      </div>
      <p className="mono mt-1 text-[11px] text-muted">{formatLastVote(board?.lastVoteAt, now)}</p>

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
                {partyAbbr(candidate.party)}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {hasVotes && leader && board ? (
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
              {tied ? (
                <>
                  <CountUp value={leader.pct} digits={1} suffix="%" /> · empate en la cima
                </>
              ) : (
                <>
                  <CountUp value={leader.pct} digits={1} suffix="%" /> · +
                  <CountUp value={board.leadIntendente.margin} digits={1} /> pts
                </>
              )}
            </p>
          </div>
        </div>
      ) : null}

      {top.length ? (
        <div className="mt-5 space-y-3">
          {top.map((row) => (
            <div key={row.id} className="min-w-0">
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="flex min-w-0 items-center gap-2">
                  <CandidatePhoto src={row.photoUrl} name={row.name} color={row.color} size={24} />
                  <span className="truncate">{shortName(row.name)}</span>
                </span>
                <span className="mono shrink-0 text-muted">
                  <CountUp value={row.pct} digits={1} suffix="%" />
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full transition-[width] duration-700"
                  style={{
                    width: cssPct(Math.max(6, (row.votes / max) * 100), 6),
                    background: row.color,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-5 min-w-0">
        <ActivitySparkline hours={board?.hourlyActivity ?? []} />
      </div>

      <Link href="/resultados" className="mt-5 inline-flex text-sm font-medium text-brand-strong">
        Ver el tablero →
      </Link>
    </aside>
  );
}

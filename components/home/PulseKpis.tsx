"use client";

import { CountUp } from "@/components/CountUp";
import {
  closePulseDuration,
  closeSrLabel,
  closeStageHint,
  closeTimeLeftPct,
  closeUrgencyHeat,
  cssPct,
  DAY_MS,
  elapsedAtRemaining,
  isCloseCritical,
  isClosingWindow,
  todaySharePct,
} from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";
import type { BoardData } from "@/lib/results";
import { shortName } from "@/lib/format";

function CloseStat({
  opensAt,
  closesAt,
  preview = false,
}: {
  opensAt: string;
  closesAt: string;
  preview?: boolean;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  const days = Math.max(0, Math.ceil(remaining / DAY_MS));
  const elapsed = preview
    ? closeTimeLeftPct(remaining)
    : elapsedAtRemaining(opensAt, closesAt, remaining);
  const closing = isClosingWindow(remaining);
  const critical = isCloseCritical(remaining);
  const heat = closeUrgencyHeat(remaining);
  const pulse = closePulseDuration(remaining);
  const hint = closeStageHint(remaining);

  return (
    <div
      className={`card min-w-0 p-4 ${
        remaining <= 0 ? "" : critical ? "close-card-critical" : closing ? "close-card-urgent" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">
          {closing ? "Hoy cierra" : "Cierra en"}
        </p>
        {preview ? (
          <span className="mono text-[9px] uppercase tracking-[0.12em] text-danger">preview</span>
        ) : null}
      </div>
      <p
        className={`mt-2 font-semibold tracking-tight ${
          closing ? "text-base" : "text-2xl"
        } ${critical ? "text-danger" : ""}`}
        aria-hidden={closing}
      >
        {remaining <= 0 ? (
          "Cerró"
        ) : closing ? (
          hint
        ) : (
          <CountUp value={days} digits={0} suffix={days === 1 ? " día" : " días"} />
        )}
      </p>
      {closing ? <p className="sr-only">{closeSrLabel(remaining)}</p> : null}
      <div className={`mt-2 overflow-hidden rounded-full bg-surface-2 ${closing ? "h-1.5" : "h-1"}`}>
        <div
          className={`h-full rounded-full ${
            closing ? "close-bar-urgent" : "bg-brand transition-[width] duration-700"
          }`}
          style={{
            width: cssPct(elapsed),
            background: heat
              ? `color-mix(in srgb, var(--brand) ${Math.round((1 - heat) * 100)}%, var(--danger) ${Math.round(heat * 100)}%)`
              : undefined,
            animationDuration: closing ? pulse : undefined,
          }}
        />
      </div>
      <p className={`mt-1 truncate text-xs ${critical ? "font-medium text-danger" : "text-muted"}`}>
        {closing ? "todavía entra tu voto" : hint}
      </p>
    </div>
  );
}

export function PulseKpis({
  board,
  previewCloseCountdown = false,
  className = "",
}: {
  board: BoardData | null;
  now?: number;
  previewCloseCountdown?: boolean;
  className?: string;
}) {
  const opensAt = board?.election.opensAt ?? "2026-09-07T00:00:00-03:00";
  const closesAt = board?.election.closesAt ?? "2026-09-16T23:59:59-03:00";
  const hasVotes = Boolean(board && board.totalVotes > 0);
  const intendente = hasVotes ? board?.leadIntendente.leader : null;
  const concejal = hasVotes ? board?.leadConcejal.leader : null;
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
        },
        {
          label: "Concejalía",
          hint: concejal ? shortName(concejal.name) : "Quien lidera ahora",
          value: concejal?.pct ?? 0,
          digits: 1,
          suffix: "%",
        },
        {
          label: "Hoy",
          hint: "de los votos de ahora",
          value: today,
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
      <CloseStat
        opensAt={opensAt}
        closesAt={closesAt}
        preview={previewCloseCountdown}
      />
    </div>
  );
}

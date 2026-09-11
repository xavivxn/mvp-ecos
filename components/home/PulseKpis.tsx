"use client";

import { CountUp } from "@/components/CountUp";
import {
  closePulseDuration,
  closeSrLabel,
  closeUrgencyHeat,
  cssPct,
  DAY_MS,
  elapsedAtRemaining,
  formatRemainingClock,
  HOUR_MS,
  isClosingWindow,
  todaySharePct,
} from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";
import type { BoardData } from "@/lib/results";

function shortName(name: string) {
  return name.replace(/^(Ing\.|Prof\.|Profe\.)\s+/i, "");
}

function closeHint(remaining: number, closing: boolean) {
  if (remaining <= 0) return "encuesta cerrada";
  if (!closing) return "para el cierre";
  if (remaining <= HOUR_MS) return "cierra ahora";
  if (remaining <= 3 * HOUR_MS) return "últimas horas";
  return "se acaba hoy";
}

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
  const elapsed = elapsedAtRemaining(opensAt, closesAt, remaining);
  const closing = isClosingWindow(remaining);
  const critical = remaining > 0 && remaining <= 3 * HOUR_MS;
  const heat = closeUrgencyHeat(remaining);
  const pulse = closePulseDuration(remaining);

  return (
    <div
      className={`card min-w-0 p-4 ${
        remaining <= 0 ? "" : critical ? "close-card-critical" : closing ? "close-card-urgent" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">Cierra en</p>
        {preview ? (
          <span className="mono text-[9px] uppercase tracking-[0.12em] text-danger">preview</span>
        ) : null}
      </div>
      <p
        className={`mt-2 text-2xl font-semibold tracking-tight ${
          remaining <= 0
            ? ""
            : critical
              ? "close-clock-critical mono tabular-nums"
              : closing
                ? "close-clock-urgent mono tabular-nums text-[1.35rem] sm:text-2xl"
                : ""
        }`}
        aria-hidden={closing}
      >
        {remaining <= 0 ? (
          "Cerró"
        ) : closing ? (
          formatRemainingClock(remaining)
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
        {closeHint(remaining, closing)}
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

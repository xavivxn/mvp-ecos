"use client";

import { ClockDigits } from "@/components/ClockDigits";
import {
  closePulseDuration,
  closeSrLabel,
  closeTint,
  closeUrgencyHeat,
  closeTimeLeftPct,
  cssPct,
  isCloseCritical,
} from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";

export function CloseUrgency({
  closesAt,
  remaining,
  preview = false,
  className = "",
}: {
  closesAt?: string | null;
  remaining?: number;
  preview?: boolean;
  className?: string;
}) {
  const live = useCloseRemaining(closesAt, preview);
  const value = preview || closesAt ? live : (remaining ?? 0);
  const ended = value <= 0;
  const heat = closeUrgencyHeat(value);
  const critical = isCloseCritical(value);
  const leftPct = closeTimeLeftPct(value);

  return (
    <span className={`inline-flex min-w-0 max-w-full items-center gap-2 ${className}`}>
      <span
        className={`min-w-0 truncate ${critical ? "close-clock-critical" : ""}`}
        style={{ color: closeTint(heat) }}
      >
        {ended ? (
          <span className="mono tabular-nums" aria-hidden>
            Cerró
          </span>
        ) : (
          <>
            <span className="mono" aria-hidden>
              Cierra en{" "}
            </span>
            <ClockDigits remaining={value} />
          </>
        )}
      </span>
      <span className="sr-only">{closeSrLabel(value)}</span>
      <span
        className="relative h-1 w-7 shrink-0 overflow-hidden rounded-full bg-surface-2 sm:w-10"
        aria-hidden
      >
        <span
          className="absolute inset-y-0 left-0 rounded-full close-mini-bar"
          style={{
            width: cssPct(leftPct),
            background: closeTint(heat, "var(--brand)", "var(--danger)"),
            animationDuration: closePulseDuration(value),
          }}
        />
      </span>
    </span>
  );
}

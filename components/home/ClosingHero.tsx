"use client";

import Link from "next/link";
import { ClockDigits } from "@/components/ClockDigits";
import {
  closeSrLabel,
  closeStageHint,
  closeTint,
  closeUrgencyHeat,
  closeVoteCta,
  isCloseCritical,
  isCloseTense,
} from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";

export function ClosingHero({
  closesAt,
  preview = false,
}: {
  closesAt: string;
  preview?: boolean;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  const tense = isCloseTense(remaining);
  const critical = isCloseCritical(remaining);
  const heat = closeUrgencyHeat(remaining);
  const hint = closeStageHint(remaining);
  const masthead = critical ? "Cierra ahora" : tense ? "Últimas horas" : "Cierra hoy";

  return (
    <div className={`min-w-0 ${tense ? "rounded-2xl bg-danger-soft/50 p-3 sm:p-4" : ""}`}>
      <p className="chip bg-danger-soft text-danger">
        <span className="mono">{masthead}</span>
        {remaining > 0 ? (
          <>
            <span className="mono text-danger/70" aria-hidden>
              ·
            </span>
            <ClockDigits remaining={remaining} className="text-[13px]" />
          </>
        ) : null}
      </p>
      <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
        Hoy cierra la encuesta.
      </h1>
      <p className="mt-4 max-w-lg text-muted">
        Queda una ventana para verificar el padrón y cargar tu voto. Un documento, un voto,
        en secreto.
      </p>
      <p
        className={`mt-6 font-semibold tracking-tight ${critical ? "close-clock-critical" : ""}`}
        style={{ color: closeTint(heat, "var(--ink)", "var(--danger)") }}
      >
        <ClockDigits remaining={remaining} className="text-4xl sm:text-5xl" />
        <span className="sr-only">{closeSrLabel(remaining)}</span>
      </p>
      <p className={`mt-1 text-sm ${critical ? "font-medium text-danger" : "text-muted"}`}>
        {hint}
      </p>
      <div className="mt-7 hidden gap-3 sm:flex">
        <Link href="/votar" className="btn-primary close-cta-ring">
          {closeVoteCta(remaining)}
        </Link>
        <Link href="/resultados" className="btn-secondary">
          Ver resultados
        </Link>
      </div>
    </div>
  );
}

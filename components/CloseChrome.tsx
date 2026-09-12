"use client";

import Link from "next/link";
import {
  closeHeaderCta,
  closeTint,
  closeUrgencyHeat,
  closeAtmosphereStage,
  closeTimeLeftPct,
  closeVoteCta,
  cssPct,
  isCloseCritical,
  isClosingWindow,
  showsCloseUrgency,
} from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";

export function CloseHeaderRule({
  closesAt,
  preview = false,
}: {
  closesAt?: string | null;
  preview?: boolean;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  if (!showsCloseUrgency(remaining, preview)) return null;

  const ended = remaining <= 0;
  const leftPct = closeTimeLeftPct(remaining);
  const heat = closeUrgencyHeat(remaining);

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 overflow-hidden bg-surface-2">
      <div
        className="h-full"
        style={{
          width: cssPct(leftPct),
          background: closeTint(heat, "var(--brand)", "var(--danger)"),
        }}
      />
    </div>
  );
}

export function CloseVoteLink({
  href,
  closesAt,
  preview = false,
  className,
  idleLabel,
}: {
  href: string;
  closesAt?: string | null;
  preview?: boolean;
  className: string;
  idleLabel: string;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  const closing = showsCloseUrgency(remaining, preview);
  const label = closing ? closeHeaderCta(remaining) : idleLabel;
  const stacked = label === "Votar ahora";

  return (
    <Link
      href={href}
      aria-label={label}
      className={`${className}${closing ? " close-cta-ring" : ""}`}
    >
      {stacked ? (
        <>
          <span className="flex flex-col items-center text-[12px] leading-[1.05] @min-[30rem]/chrome:hidden">
            <span>Votar</span>
            <span>ahora</span>
          </span>
          <span className="hidden whitespace-nowrap @min-[30rem]/chrome:inline">
            Votar ahora
          </span>
        </>
      ) : (
        label
      )}
    </Link>
  );
}

export function CloseAtmosphereGlow({
  closesAt,
  preview = false,
  closed = false,
}: {
  closesAt?: string | null;
  preview?: boolean;
  closed?: boolean;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  const stage = closeAtmosphereStage(remaining, preview, closed);

  return (
    <div className={`close-atmosphere close-atmosphere-${stage}`} aria-hidden>
      <div className="close-atmosphere-orb close-atmosphere-orb-a" />
      <div className="close-atmosphere-orb close-atmosphere-orb-b" />
      <div className="close-atmosphere-orb close-atmosphere-orb-c" />
    </div>
  );
}

export function CloseStickyCta({
  closesAt,
  preview = false,
}: {
  closesAt?: string | null;
  preview?: boolean;
}) {
  const remaining = useCloseRemaining(closesAt, preview);
  const closing = isClosingWindow(remaining) || preview;
  const critical = isCloseCritical(remaining);

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur md:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <Link href="/votar" className={`btn-primary w-full${closing ? " close-cta-ring" : ""}`}>
        {closing ? closeVoteCta(remaining) : "Cargar mi voto"}
      </Link>
      {critical ? <p className="sr-only">Quedan menos de tres horas para votar.</p> : null}
    </div>
  );
}

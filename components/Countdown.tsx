"use client";

import { useEffect, useState } from "react";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    const frame = requestAnimationFrame(() => setNow(Date.now()));
    return () => {
      window.clearInterval(id);
      cancelAnimationFrame(frame);
    };
  }, []);

  const end = new Date(target).getTime();
  const diff = Math.max(0, end - (now ?? end));
  const days = Math.floor(diff / 86_400_000);
  const hours = Math.floor((diff % 86_400_000) / 3_600_000);
  const mins = Math.floor((diff % 3_600_000) / 60_000);
  const secs = Math.floor((diff % 60_000) / 1000);

  const items = [
    [days, "días"],
    [hours, "horas"],
    [mins, "min"],
    [secs, "seg"],
  ] as const;

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map(([value, label]) => (
        <div key={label} className="rounded-2xl border border-line bg-ink-2/70 px-2 py-3 text-center">
          <div className="font-display text-2xl tabular-nums sm:text-3xl">{now ? pad(value) : "--"}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.18em] text-cream-dim">{label}</div>
        </div>
      ))}
    </div>
  );
}

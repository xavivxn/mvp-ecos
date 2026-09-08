"use client";

import { useEffect, useState } from "react";
import { CountUp } from "./CountUp";
import type { BoardData, RankedChoice } from "@/lib/results";

function Bar({ row, max }: { row: RankedChoice; max: number }) {
  const width = max ? Math.max(4, (row.votes / max) * 100) : 4;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-cream-dim">{row.party}</p>
        </div>
        <p className="text-right tabular-nums">
          <span className="font-display text-xl">{row.pct.toFixed(1)}%</span>
          <span className="ml-2 text-sm text-cream-dim">{row.votes}</span>
        </p>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-ink-2">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${width}%`, background: row.color }}
        />
      </div>
    </div>
  );
}

function Race({ title, rows, lead }: { title: string; rows: RankedChoice[]; lead: BoardData["leadIntendente"] }) {
  const max = Math.max(...rows.map((r) => r.votes), 1);
  return (
    <section className="rounded-3xl border border-line bg-ink-2/50 p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      {lead.leader ? (
        <p className="mt-2 text-sm text-gold-2">
          {Math.abs(lead.margin) < 0.05
            ? `Hay empate en la cima (${lead.leader.pct.toFixed(1)}%).`
            : `Lidera ${lead.leader.name} por ${lead.margin.toFixed(1)} puntos.`}
        </p>
      ) : (
        <p className="mt-2 text-sm text-cream-dim">Todavía no hay votos en esta categoría.</p>
      )}
      <div className="mt-6 space-y-5">
        {rows.map((row) => (
          <Bar key={row.id} row={row} max={max} />
        ))}
      </div>
    </section>
  );
}

export function ResultsBoard({ initial }: { initial: BoardData }) {
  const [board, setBoard] = useState(initial);

  useEffect(() => {
    const id = window.setInterval(async () => {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) setBoard(data);
    }, 15000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Votos", board.totalVotes, 0, ""],
          ["Últimas 24 h", board.votesLast24h, 0, ""],
          ["Visitantes", board.uniqueVisitors, 0, ""],
          ["Conversión", board.conversion, 1, "%"],
        ].map(([label, value, digits, suffix]) => (
          <div key={String(label)} className="rounded-2xl border border-line bg-ink-2/70 p-4">
            <p className="text-[11px] uppercase tracking-wider text-cream-dim">{label}</p>
            <p className="mt-2 font-display text-2xl">
              <CountUp value={Number(value)} digits={Number(digits)} suffix={String(suffix)} />
            </p>
          </div>
        ))}
      </div>
      <Race title="Intendencia" rows={board.intendente} lead={board.leadIntendente} />
      <Race title="Concejalía por lista" rows={board.concejal} lead={board.leadConcejal} />
      <p className="text-center text-xs text-cream-dim">Actualización automática cada 15 segundos.</p>
    </div>
  );
}

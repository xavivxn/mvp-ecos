"use client";

import { useEffect, useRef, useState } from "react";
import { CountUp } from "./CountUp";
import { LiveChip } from "./LiveChip";
import type { BoardData, RankedChoice } from "@/lib/results";

function Bar({ row, max }: { row: RankedChoice; max: number }) {
  const width = max ? Math.max(4, (row.votes / max) * 100) : 4;
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{row.name}</p>
          <p className="text-sm text-muted">{row.party}</p>
        </div>
        <p className="text-right">
          <span className="mono text-lg">{row.pct.toFixed(1)}%</span>
          <span className="ml-2 text-sm text-muted">{row.votes} votos</span>
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-[width] duration-700"
          style={{ width: `${width}%`, background: row.color }}
        />
      </div>
    </div>
  );
}

function Race({
  title,
  rows,
  lead,
}: {
  title: string;
  rows: RankedChoice[];
  lead: BoardData["leadIntendente"];
}) {
  const regular = rows.filter((r) => !r.isSpecial);
  const special = rows.filter((r) => r.isSpecial);
  const max = Math.max(...rows.map((r) => r.votes), 1);
  const tied = lead.leader && Math.abs(lead.margin) < 0.05;

  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      {lead.leader && lead.leader.votes > 0 ? (
        <div className="card border-brand/30 bg-brand-soft/60 p-5">
          <span className="chip bg-brand text-on-brand">Lidera</span>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">{lead.leader.name}</h3>
          <p className="text-sm text-muted">{lead.leader.party}</p>
          <p className="mt-2 font-medium text-brand-strong">
            {tied
              ? `${lead.leader.pct.toFixed(1)}% · empate en la cima`
              : `${lead.leader.pct.toFixed(1)}% · +${lead.margin.toFixed(1)} pts`}
          </p>
        </div>
      ) : (
        <p className="text-sm text-muted">Todavía no hay votos en esta categoría.</p>
      )}
      <div className="card space-y-5 p-5">
        {regular.map((row) => (
          <Bar key={row.id} row={row} max={max} />
        ))}
        <div className="border-t border-line pt-4">
          <p className="mono mb-4 text-[11px] uppercase tracking-[0.14em] text-muted">
            Opciones especiales
          </p>
          <div className="space-y-5">
            {special.map((row) => (
              <Bar key={row.id} row={row} max={max} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ResultsBoard({ initial }: { initial: BoardData }) {
  const [board, setBoard] = useState(initial);
  const [age, setAge] = useState(0);
  const [tab, setTab] = useState<"intendente" | "concejal">("intendente");
  const updatedAtRef = useRef(0);

  useEffect(() => {
    updatedAtRef.current = Date.now();
    const poll = window.setInterval(async () => {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      if (data.ok) {
        setBoard(data);
        updatedAtRef.current = Date.now();
        setAge(0);
      }
    }, 15000);
    const tick = window.setInterval(() => {
      setAge(Math.max(0, Math.round((Date.now() - updatedAtRef.current) / 1000)));
    }, 1000);
    return () => {
      window.clearInterval(poll);
      window.clearInterval(tick);
    };
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <LiveChip />
        <p className="mono text-xs text-muted" aria-live="polite">
          Actualizado hace {age}s
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Votos", board.totalVotes, 0, ""],
          ["Últimas 24 h", board.votesLast24h, 0, ""],
          ["Visitantes", board.uniqueVisitors, 0, ""],
          ["Conversión", board.conversion, 1, "%"],
        ].map(([label, value, digits, suffix]) => (
          <div key={String(label)} className="card p-4">
            <p className="mono text-[11px] uppercase tracking-[0.14em] text-muted">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              <CountUp value={Number(value)} digits={Number(digits)} suffix={String(suffix)} />
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-1 rounded-xl bg-surface p-1 lg:hidden">
        <button
          type="button"
          onClick={() => setTab("intendente")}
          className={`h-10 rounded-lg text-sm font-medium ${
            tab === "intendente" ? "bg-bg shadow-sm" : "text-muted"
          }`}
        >
          Intendencia
        </button>
        <button
          type="button"
          onClick={() => setTab("concejal")}
          className={`h-10 rounded-lg text-sm font-medium ${
            tab === "concejal" ? "bg-bg shadow-sm" : "text-muted"
          }`}
        >
          Concejalía
        </button>
      </div>

      <div className="hidden gap-8 lg:grid lg:grid-cols-2">
        <Race title="Intendencia" rows={board.intendente} lead={board.leadIntendente} />
        <Race title="Concejalía por lista" rows={board.concejal} lead={board.leadConcejal} />
      </div>
      <div className="lg:hidden">
        {tab === "intendente" ? (
          <Race title="Intendencia" rows={board.intendente} lead={board.leadIntendente} />
        ) : (
          <Race title="Concejalía por lista" rows={board.concejal} lead={board.leadConcejal} />
        )}
      </div>

      <p className="text-center text-xs text-muted">
        Encuesta no oficial, muestra autoseleccionada. No es un cómputo del TSJE.
      </p>
    </div>
  );
}

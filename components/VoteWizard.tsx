"use client";

import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState, type FormEvent } from "react";
import { TurnstileField } from "./TurnstileField";
import { CandidateCard } from "./CandidateCard";
import { SpecialChoice } from "./SpecialChoice";
import type { Candidate } from "@/lib/types";

type Step = "verify" | "intendente" | "concejal" | "confirm" | "done" | "error";

const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export function VoteWizard({
  intendentes,
  concejales,
  turnstileSiteKey,
  alreadyVoted,
  isOpen,
}: {
  intendentes: Candidate[];
  concejales: Candidate[];
  turnstileSiteKey: string;
  alreadyVoted: boolean;
  isOpen: boolean;
}) {
  const [step, setStep] = useState<Step>(alreadyVoted ? "done" : "verify");
  const [cedula, setCedula] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [turnstile, setTurnstile] = useState("");
  const [token, setToken] = useState("");
  const [district, setDistrict] = useState<string | null>(null);
  const [intendente, setIntendente] = useState("");
  const [concejal, setConcejal] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);

  const fechaNacimiento = useMemo(() => {
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }, [day, month, year]);

  const intendenteLabel =
    intendente === "blanco" || intendente === "nulo"
      ? intendente === "blanco"
        ? "Voto en blanco"
        : "Voto nulo"
      : intendentes.find((c) => c.id === intendente)?.name ?? "";
  const concejalLabel =
    concejal === "blanco" || concejal === "nulo"
      ? concejal === "blanco"
        ? "Voto en blanco"
        : "Voto nulo"
      : concejales.find((c) => c.id === concejal)?.name ?? "";

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: cedula.replace(/\D/g, ""),
          fechaNacimiento,
          turnstileToken: turnstile || "dev",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo verificar.");
        if (data.code === "already_voted") setStep("done");
        return;
      }
      setToken(data.token);
      setDistrict(data.district);
      setDemo(Boolean(data.demo));
      setStep("intendente");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          intendente,
          concejal,
          turnstileToken: turnstile || "dev",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el voto.");
        return;
      }
      setStep("done");
    } catch {
      setError("Error de red. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  }

  if (!isOpen && step !== "done") {
    return (
      <p className="rounded-2xl border border-line bg-ink-2 p-6 text-center text-cream-dim">
        La encuesta no está abierta en este momento.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex gap-2">
        {["Cédula", "Intendencia", "Concejalía", "Confirmar"].map((label, i) => {
          const active =
            ["verify", "intendente", "concejal", "confirm", "done"].indexOf(step) >= i;
          return (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full ${active ? "bg-gold" : "bg-line"}`} />
              <p className="mt-2 hidden text-[11px] uppercase tracking-wider text-cream-dim sm:block">
                {label}
              </p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.22 }}
        >
          {step === "verify" && (
            <form onSubmit={verify} className="space-y-5">
              <div>
                <h1 className="font-display text-3xl">Validá tu cédula</h1>
                <p className="mt-2 text-cream-dim">
                  Consultamos el padrón nacional para confirmar que estás habilitado. Tu número no se
                  guarda en texto plano.
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm">Número de cédula</span>
                <input
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={10}
                  required
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                  placeholder="Sin puntos"
                  className="h-12 w-full rounded-2xl border border-line bg-ink-2 px-4 text-lg outline-none focus:border-gold"
                />
              </label>
              <div>
                <span className="mb-2 block text-sm">Fecha de nacimiento</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    required
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                    className="h-12 rounded-2xl border border-line bg-ink-2 px-2"
                  >
                    <option value="">Día</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="h-12 rounded-2xl border border-line bg-ink-2 px-2"
                  >
                    <option value="">Mes</option>
                    {MONTHS.map((name, i) => (
                      <option key={name} value={String(i + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select
                    required
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="h-12 rounded-2xl border border-line bg-ink-2 px-2"
                  >
                    <option value="">Año</option>
                    {Array.from({ length: 90 }, (_, i) => 2008 - i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <TurnstileField siteKey={turnstileSiteKey} onToken={setTurnstile} />
              <button
                type="submit"
                disabled={busy}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gold font-semibold text-ink disabled:opacity-60"
              >
                {busy ? "Consultando padrón TSJE…" : "Validar y continuar"}
              </button>
            </form>
          )}

          {step === "intendente" && (
            <div className="space-y-4">
              <h1 className="font-display text-3xl">Intendencia</h1>
              <p className="text-cream-dim">Elegí un candidato o una opción especial.</p>
              {intendentes.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  selected={intendente === c.id}
                  onSelect={() => setIntendente(c.id)}
                />
              ))}
              <SpecialChoice kind="blanco" selected={intendente === "blanco"} onSelect={() => setIntendente("blanco")} />
              <SpecialChoice kind="nulo" selected={intendente === "nulo"} onSelect={() => setIntendente("nulo")} />
              <button
                type="button"
                disabled={!intendente}
                onClick={() => setStep("concejal")}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gold font-semibold text-ink disabled:opacity-60"
              >
                Continuar
              </button>
            </div>
          )}

          {step === "concejal" && (
            <div className="space-y-4">
              <h1 className="font-display text-3xl">Concejalía</h1>
              <p className="text-cream-dim">Elegí una lista. En el MVP el voto es por lista, no preferencial.</p>
              {concejales.map((c) => (
                <CandidateCard
                  key={c.id}
                  candidate={c}
                  selected={concejal === c.id}
                  onSelect={() => setConcejal(c.id)}
                />
              ))}
              <SpecialChoice kind="blanco" selected={concejal === "blanco"} onSelect={() => setConcejal("blanco")} />
              <SpecialChoice kind="nulo" selected={concejal === "nulo"} onSelect={() => setConcejal("nulo")} />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep("intendente")}
                  className="h-12 flex-1 rounded-full border border-line"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  disabled={!concejal}
                  onClick={() => setStep("confirm")}
                  className="h-12 flex-[2] rounded-full bg-gold font-semibold text-ink disabled:opacity-60"
                >
                  Revisar
                </button>
              </div>
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-5">
              <h1 className="font-display text-3xl">Confirmá tu voto</h1>
              {demo ? (
                <p className="rounded-2xl border border-gold/30 bg-gold/10 px-4 py-3 text-sm">
                  Modo demostración: la consulta al padrón está simulada.
                </p>
              ) : null}
              {district ? (
                <p className="text-sm text-cream-dim">Distrito detectado: {district}</p>
              ) : null}
              <ul className="space-y-3 rounded-2xl border border-line bg-ink-2 p-4">
                <li>
                  <span className="text-cream-dim">Intendencia</span>
                  <div className="text-lg">{intendenteLabel}</div>
                </li>
                <li>
                  <span className="text-cream-dim">Concejalía</span>
                  <div className="text-lg">{concejalLabel}</div>
                </li>
              </ul>
              <TurnstileField siteKey={turnstileSiteKey} onToken={setTurnstile} />
              <button
                type="button"
                disabled={busy}
                onClick={() => void submit()}
                className="flex h-12 w-full items-center justify-center rounded-full bg-gold font-semibold text-ink disabled:opacity-60"
              >
                {busy ? "Registrando…" : "Enviar intención de voto"}
              </button>
              <button type="button" onClick={() => setStep("concejal")} className="w-full text-sm text-cream-dim">
                Volver a editar
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-4 text-center">
              <h1 className="font-display text-3xl">Listo, quedó registrado</h1>
              <p className="text-cream-dim">
                Gracias. Esta cédula ya no puede volver a votar en esta encuesta.
              </p>
              <a
                href="/resultados"
                className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-6 font-semibold text-ink"
              >
                Ver resultados
              </a>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error ? <p className="mt-4 rounded-2xl bg-[#8C4A4A]/20 px-4 py-3 text-sm">{error}</p> : null}
    </div>
  );
}

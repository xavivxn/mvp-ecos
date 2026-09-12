"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Check, IdCard, Share2 } from "lucide-react";
import { TurnstileField } from "./TurnstileField";
import { CandidateCard } from "./CandidateCard";
import { CandidatePhoto } from "./CandidatePhoto";
import { PartyCard } from "./PartyCard";
import { SpecialChoice } from "./SpecialChoice";
import { partySurface } from "@/lib/color";
import { StatusScreen } from "./StatusScreen";
import { groupCandidatesByParty } from "@/lib/party";
import { sortCandidatesByVotes } from "@/lib/results";
import { recordRecapEvent } from "@/lib/recap";
import { CloseUrgency } from "./CloseUrgency";
import { isCloseCritical, showsCloseUrgency } from "@/lib/pulse";
import { useCloseRemaining } from "@/lib/usePreviewClose";
import type { Candidate, ChoiceCount } from "@/lib/types";

type Step = "verify" | "intendente" | "concejal" | "confirm" | "done";

const STEPS = ["Cédula", "Intendencia", "Concejalía", "Confirmar"] as const;
const STEP_INDEX: Record<Step, number> = {
  verify: 0,
  intendente: 1,
  concejal: 2,
  confirm: 3,
  done: 4,
};

function voteCounts(rows?: { id: string; votes: number; isSpecial?: boolean }[]): ChoiceCount[] {
  return (rows ?? [])
    .filter((row) => !row.isSpecial)
    .map((row) => ({ choice: row.id, votes: row.votes }));
}

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
  allowRepeatVotes = false,
  isOpen,
  closesAt,
  previewCloseCountdown = false,
}: {
  intendentes: Candidate[];
  concejales: Candidate[];
  turnstileSiteKey: string;
  alreadyVoted: boolean;
  allowRepeatVotes?: boolean;
  isOpen: boolean;
  closesAt?: string | null;
  previewCloseCountdown?: boolean;
}) {
  const [step, setStep] = useState<Step>(alreadyVoted ? "done" : "verify");
  const [cedula, setCedula] = useState("");
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [turnstile, setTurnstile] = useState("");
  const [turnstileKey, setTurnstileKey] = useState(0);
  const [token, setToken] = useState("");
  const [district, setDistrict] = useState<string | null>(null);
  const [intendente, setIntendente] = useState("");
  const [concejal, setConcejal] = useState("");
  const [concejalParty, setConcejalParty] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rankedIntendentes, setRankedIntendentes] = useState(intendentes);
  const [rankedConcejales, setRankedConcejales] = useState(concejales);
  const remaining = useCloseRemaining(closesAt, previewCloseCountdown);
  const timedOut = Boolean(closesAt) && remaining <= 0 && !previewCloseCountdown;

  useEffect(() => {
    setRankedIntendentes(intendentes);
  }, [intendentes]);

  useEffect(() => {
    setRankedConcejales(concejales);
  }, [concejales]);

  const partyGroups = useMemo(
    () => groupCandidatesByParty(rankedConcejales),
    [rankedConcejales],
  );
  const selectedParty = partyGroups.find((group) => group.party === concejalParty) ?? null;

  useEffect(() => {
    if (step !== "intendente" && step !== "concejal") return;

    let cancelled = false;
    const refresh = async () => {
      const res = await fetch("/api/results", { cache: "no-store" });
      if (!res.ok || cancelled) return;
      const data = (await res.json()) as {
        ok?: boolean;
        intendente?: { id: string; votes: number; isSpecial?: boolean }[];
        concejal?: { id: string; votes: number; isSpecial?: boolean }[];
      };
      if (!data.ok || cancelled) return;
      setRankedIntendentes(sortCandidatesByVotes(intendentes, voteCounts(data.intendente)));
      setRankedConcejales(sortCandidatesByVotes(concejales, voteCounts(data.concejal)));
    };

    void refresh();
    const id = window.setInterval(() => void refresh(), 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [step, intendentes, concejales]);

  const fechaNacimiento = useMemo(() => {
    if (!day || !month || !year) return "";
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }, [day, month, year]);

  const hasRequiredFields = Boolean(cedula) && Boolean(day) && Boolean(month) && Boolean(year);
  const turnstileReady = Boolean(turnstile);
  const canVerify = hasRequiredFields && turnstileReady && !busy;
  const canSubmitVote = Boolean(intendente) && Boolean(concejal) && turnstileReady && !busy;

  function resetTurnstile() {
    setTurnstile("");
    setTurnstileKey((key) => key + 1);
  }

  const intendenteChoice =
    intendente === "blanco"
      ? { name: "Voto en blanco", party: "Opción especial", color: "#C4B8A5", photoUrl: null }
      : intendentes.find((c) => c.id === intendente);
  const concejalChoice =
    concejal === "blanco"
      ? { name: "Voto en blanco", party: "Opción especial", color: "#C4B8A5", photoUrl: null }
      : concejales.find((c) => c.id === concejal);

  async function verify(e: FormEvent) {
    e.preventDefault();
    if (!canVerify) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cedula: cedula.replace(/\D/g, ""),
          fechaNacimiento,
          turnstileToken: turnstile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo verificar.");
        resetTurnstile();
        if (data.code === "already_voted" && !allowRepeatVotes) setStep("done");
        return;
      }
      setToken(data.token);
      setDistrict(data.district);
      setDemo(Boolean(data.demo));
      setStep("intendente");
    } catch {
      setError("Error de red. Intentá de nuevo.");
      resetTurnstile();
    } finally {
      setBusy(false);
    }
  }

  async function submit() {
    if (!canSubmitVote) return;
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
          turnstileToken: turnstile,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar el voto.");
        resetTurnstile();
        return;
      }
      setStep("done");
    } catch {
      setError("Error de red. Intentá de nuevo.");
      resetTurnstile();
    } finally {
      setBusy(false);
    }
  }

  async function share() {
    const url = window.location.origin;
    const text = "Ya dejé mi intención de voto en Ecos · Yaguarón. Sumate:";
    recordRecapEvent("invite_share_click");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Ecos Yaguarón", text, url });
        recordRecapEvent("invite_share_native");
        return;
      }
      await navigator.clipboard.writeText(`${text} ${url}`);
      recordRecapEvent("invite_share_copy");
      setCopied(true);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      await navigator.clipboard.writeText(url);
      recordRecapEvent("invite_share_copy");
      setCopied(true);
    }
  }

  if ((!isOpen || timedOut) && step !== "done") {
    return (
      <StatusScreen
        variant="closed"
        title="La encuesta está cerrada"
        body="Ya no se pueden cargar más votos. El acta con el resultado final está en la portada."
        action={
          <a href="/" className="btn-primary">
            Ver el acta
          </a>
        }
      />
    );
  }

  const current = STEP_INDEX[step];
  const showBar = step !== "done" && step !== "verify";

  return (
    <div className={showBar ? "pb-28" : ""}>
      {allowRepeatVotes ? (
        <p className="mb-6 rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm">
          Modo ensayo: se puede votar más de una vez. El padrón sigue activo.
        </p>
      ) : null}
      {showsCloseUrgency(remaining, previewCloseCountdown) && step !== "done" ? (
        <p
          className={`mb-6 rounded-xl bg-danger-soft text-sm ${
            isCloseCritical(remaining)
              ? "border-2 border-danger px-4 py-4"
              : "border border-danger/20 px-4 py-3"
          }`}
        >
          <CloseUrgency closesAt={closesAt} preview={previewCloseCountdown} />
          <span className="mt-1 block text-danger">
            {isCloseCritical(remaining)
              ? "Cierra ahora. Cargá tu voto."
              : "Quedan las últimas horas para cargar tu voto."}
          </span>
        </p>
      ) : null}
      {step !== "done" ? (
        <ol className="mb-8 flex gap-2">
          {STEPS.map((label, i) => {
            const active = current >= i;
            return (
              <li key={label} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full text-xs font-semibold ${
                    active ? "bg-brand text-on-brand" : "bg-surface-2 text-muted"
                  }`}
                >
                  {i + 1}
                </span>
                <span className={`text-center text-[11px] ${active ? "text-ink" : "text-muted"}`}>
                  {label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : null}

      <AnimatePresence mode="wait">
        <motion.div
          key={`${step}-${concejalParty ?? "partidos"}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {step === "verify" && (
            <form onSubmit={verify} className="space-y-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Validá tu cédula</h1>
                <p className="mt-2 text-muted">
                  Contrastamos tu cédula y fecha de nacimiento con el padrón de Yaguarón.
                </p>
              </div>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Número de cédula</span>
                <span className="relative block">
                  <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <input
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={10}
                    required
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value.replace(/\D/g, ""))}
                    placeholder="Sin puntos"
                    className="field field-icon"
                  />
                </span>
                <span className="mt-1.5 block text-xs text-muted">Escribí solo números.</span>
              </label>
              <div>
                <span className="mb-2 block text-sm font-medium">Fecha de nacimiento</span>
                <div className="grid grid-cols-3 gap-2">
                  <select required value={day} onChange={(e) => setDay(e.target.value)} className="field">
                    <option value="">Día</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={String(d)}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select required value={month} onChange={(e) => setMonth(e.target.value)} className="field">
                    <option value="">Mes</option>
                    {MONTHS.map((name, i) => (
                      <option key={name} value={String(i + 1)}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <select required value={year} onChange={(e) => setYear(e.target.value)} className="field">
                    <option value="">Año</option>
                    {Array.from({ length: 90 }, (_, i) => 2008 - i).map((y) => (
                      <option key={y} value={String(y)}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setWhyOpen((v) => !v)}
                className="text-left text-sm font-medium text-brand-strong"
              >
                ¿Por qué pedimos esto?
              </button>
              {whyOpen ? (
                <p className="rounded-xl bg-surface p-3 text-sm text-muted">
                  La cédula y la fecha de nacimiento sirven para confirmar que estás en el padrón
                  de Yaguarón y para impedir un segundo voto. No se guarda el número: solo un hash.
                  El voto queda separado de esa verificación.
                </p>
              ) : null}
              <TurnstileField
                siteKey={turnstileSiteKey}
                onToken={setTurnstile}
                resetKey={turnstileKey}
              />
              <button type="submit" disabled={!canVerify} className="btn-primary w-full">
                {busy ? (
                  <span className="flex items-center gap-2">
                    <span className="flex gap-1" aria-hidden>
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-brand [animation-delay:-0.2s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-brand [animation-delay:-0.1s]" />
                      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-on-brand" />
                    </span>
                    Validando contra el padrón…
                  </span>
                ) : (
                  "Validar y continuar"
                )}
              </button>
            </form>
          )}

          {step === "intendente" && (
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight">Intendencia</h1>
              <p className="text-muted">
                Elegí un candidato o votá en blanco. El orden sigue los votos actuales.
              </p>
              {rankedIntendentes.map((c) => (
                <motion.div key={c.id} layout>
                  <CandidateCard
                    candidate={c}
                    selected={intendente === c.id}
                    onSelect={() => setIntendente(c.id)}
                  />
                </motion.div>
              ))}
              <SpecialChoice selected={intendente === "blanco"} onSelect={() => setIntendente("blanco")} />
            </div>
          )}

          {step === "concejal" && (
            <div className="space-y-3">
              <h1 className="text-2xl font-semibold tracking-tight">Concejalía</h1>
              {selectedParty ? (
                <>
                  <p className="text-muted">
                    Elegí un candidato de {selectedParty.abbr} o votá en blanco.
                  </p>
                  {selectedParty.members.map((c) => (
                    <motion.div key={c.id} layout>
                      <CandidateCard
                        candidate={c}
                        selected={concejal === c.id}
                        hideParty
                        onSelect={() => setConcejal(c.id)}
                      />
                    </motion.div>
                  ))}
                  <SpecialChoice
                    selected={concejal === "blanco"}
                    onSelect={() => setConcejal("blanco")}
                  />
                </>
              ) : (
                <>
                  <p className="text-muted">
                    Elegí un movimiento. Después ves a sus candidatos.
                  </p>
                  {partyGroups.map((group) => (
                    <PartyCard
                      key={group.party}
                      abbr={group.abbr}
                      party={group.party}
                      color={group.color}
                      count={group.members.length}
                      onSelect={() => {
                        setConcejal("");
                        setConcejalParty(group.party);
                      }}
                    />
                  ))}
                  <SpecialChoice
                    selected={concejal === "blanco"}
                    onSelect={() => setConcejal("blanco")}
                  />
                </>
              )}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold tracking-tight">Confirmá tu voto</h1>
              {demo ? (
                <p className="rounded-xl border border-brand/20 bg-brand-soft px-4 py-3 text-sm">
                  Modo demostración: la consulta al padrón está simulada.
                </p>
              ) : null}
              {district ? (
                <p className="mono text-xs uppercase tracking-wider text-muted">Distrito · {district}</p>
              ) : null}
              <ul className="space-y-2">
                <li
                  className="flex items-center gap-3 rounded-xl border-2 p-4"
                  style={partySurface(intendenteChoice?.color ?? "#C4B8A5")}
                >
                  <CandidatePhoto
                    src={intendenteChoice?.photoUrl}
                    name={intendenteChoice?.name ?? ""}
                    color={intendenteChoice?.color ?? "#C4B8A5"}
                    size={72}
                  />
                  <div className="min-w-0">
                    <span className="text-sm text-muted">Intendencia</span>
                    <div className="text-lg font-medium leading-tight">{intendenteChoice?.name}</div>
                    {intendenteChoice?.party ? (
                      <div className="text-sm font-medium" style={{ color: intendenteChoice.color }}>
                        {intendenteChoice.party}
                      </div>
                    ) : null}
                  </div>
                </li>
                <li
                  className="flex items-center gap-3 rounded-xl border-2 p-4"
                  style={partySurface(concejalChoice?.color ?? "#C4B8A5")}
                >
                  <CandidatePhoto
                    src={concejalChoice?.photoUrl}
                    name={concejalChoice?.name ?? ""}
                    color={concejalChoice?.color ?? "#C4B8A5"}
                    size={72}
                  />
                  <div className="min-w-0">
                    <span className="text-sm text-muted">Concejalía</span>
                    <div className="text-lg font-medium leading-tight">{concejalChoice?.name}</div>
                    {concejalChoice?.party ? (
                      <div className="text-sm font-medium" style={{ color: concejalChoice.color }}>
                        {concejalChoice.party}
                      </div>
                    ) : null}
                  </div>
                </li>
              </ul>
              <TurnstileField
                siteKey={turnstileSiteKey}
                onToken={setTurnstile}
                resetKey={turnstileKey}
              />
              <button type="button" onClick={() => setStep("concejal")} className="btn-ghost inline-flex w-full text-sm">
                Volver a editar
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="space-y-5 text-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand text-on-brand"
              >
                <Check className="h-7 w-7" strokeWidth={2.5} />
              </motion.span>
              <h1 className="text-2xl font-semibold tracking-tight">Listo, quedó registrado</h1>
              <p className="text-muted">
                {allowRepeatVotes
                  ? "Quedó cargado. En modo ensayo esta cédula puede volver a votar."
                  : "Gracias. Esta cédula ya no puede volver a votar en esta encuesta."}
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                <a href="/resultados" className="btn-primary">
                  Ver resultados
                </a>
                {allowRepeatVotes ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep("verify");
                      setIntendente("");
                      setConcejal("");
                      setConcejalParty(null);
                      setToken("");
                      resetTurnstile();
                      setError("");
                    }}
                    className="btn-secondary"
                  >
                    Votar de nuevo
                  </button>
                ) : (
                  <button type="button" onClick={() => void share()} className="btn-secondary gap-2">
                    <Share2 className="h-4 w-4" />
                    {copied ? "Enlace copiado" : "Invitá a un vecino"}
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {error ? (
        <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : null}

      {showBar ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-bg/95 p-3 backdrop-blur pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto flex max-w-xl gap-2">
            {step === "concejal" ? (
              <button
                type="button"
                onClick={() => {
                  if (concejalParty) setConcejalParty(null);
                  else setStep("intendente");
                }}
                className="btn-secondary flex-1"
              >
                Atrás
              </button>
            ) : null}
            {step === "intendente" ? (
              <button
                type="button"
                disabled={!intendente}
                onClick={() => setStep("concejal")}
                className="btn-primary flex-1"
              >
                Continuar
              </button>
            ) : null}
            {step === "concejal" ? (
              <button
                type="button"
                disabled={!concejal}
                onClick={() => {
                  resetTurnstile();
                  setStep("confirm");
                }}
                className="btn-primary flex-[2]"
              >
                Revisar
              </button>
            ) : null}
            {step === "confirm" ? (
              <button
                type="button"
                disabled={!canSubmitVote}
                onClick={() => void submit()}
                className="btn-primary flex-1"
              >
                {busy ? "Registrando…" : "Enviar intención de voto"}
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}

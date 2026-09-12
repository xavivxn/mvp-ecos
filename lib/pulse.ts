const HOT_MS = 15 * 60 * 1000;

export function isPulseHot(lastVoteAt: string | null | undefined, now = Date.now()) {
  if (!lastVoteAt) return false;
  const t = new Date(lastVoteAt).getTime();
  if (!Number.isFinite(t)) return false;
  const diff = now - t;
  return diff >= 0 && diff < HOT_MS;
}

export function formatLastVote(lastVoteAt: string | null | undefined, now = Date.now()) {
  if (!lastVoteAt) return "Aguardando el primero";
  const t = new Date(lastVoteAt).getTime();
  if (!Number.isFinite(t)) return "Aguardando el primero";
  const diff = Math.max(0, now - t);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Último voto hace instantes";
  if (mins < 60) return `Último voto hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Último voto hace ${hours} h`;
  const days = Math.floor(hours / 24);
  return `Último voto hace ${days} d`;
}

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;
export const CLOSE_TENSE_MS = 6 * HOUR_MS;
export const CLOSE_CRITICAL_MS = 3 * HOUR_MS;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function daysUntil(iso: string, now = Date.now()) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / DAY_MS));
}

export function msUntil(iso: string, now = Date.now()) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return 0;
  return Math.max(0, t - now);
}

export function isClosingWindow(msRemaining: number) {
  return msRemaining > 0 && msRemaining <= DAY_MS;
}

export function isCloseTense(msRemaining: number) {
  return msRemaining > 0 && msRemaining <= CLOSE_TENSE_MS;
}

export function isCloseCritical(msRemaining: number) {
  return msRemaining > 0 && msRemaining <= CLOSE_CRITICAL_MS;
}

export function closeStageHint(msRemaining: number) {
  if (msRemaining <= 0) return "encuesta cerrada";
  if (!isClosingWindow(msRemaining)) return "para el cierre";
  if (isCloseCritical(msRemaining)) return "cierra ahora";
  if (isCloseTense(msRemaining)) return "últimas horas";
  return "se acaba hoy";
}

export function closeVoteCta(msRemaining: number) {
  if (isCloseCritical(msRemaining)) return "Cerrar mi voto ahora";
  if (isClosingWindow(msRemaining)) return "Últimas horas · Cargar mi voto";
  return "Cargar mi voto";
}

export function closeHeaderCta(msRemaining: number) {
  if (isCloseCritical(msRemaining)) return "Votar ahora";
  return "Votar";
}

export function closeHeat(msRemaining: number) {
  if (msRemaining <= 0) return 1;
  if (msRemaining >= DAY_MS) return 0;
  return 1 - msRemaining / DAY_MS;
}

export function closeUrgencyHeat(msRemaining: number) {
  if (msRemaining > DAY_MS) return 0;
  return 0.38 + closeHeat(msRemaining) * 0.62;
}

export function closePulseDuration(msRemaining: number) {
  return `${Math.max(0.55, 1.85 - closeHeat(msRemaining) * 1.25).toFixed(2)}s`;
}

export function closeTint(heat: number, from = "var(--muted)", to = "var(--danger)") {
  const h = Math.min(1, Math.max(0, heat));
  return `color-mix(in srgb, ${from} ${Math.round((1 - h) * 100)}%, ${to} ${Math.round(h * 100)}%)`;
}

export function showsCloseUrgency(remaining: number | null | undefined, preview = false) {
  if (preview) return true;
  if (remaining == null || !Number.isFinite(remaining)) return false;
  return isClosingWindow(remaining);
}

export function closeAtmosphereStage(
  remaining: number,
  preview = false,
  closed = false,
) {
  if (closed || (!preview && remaining <= 0)) return "recap";
  if (isCloseCritical(remaining)) return "critical";
  if (isCloseTense(remaining)) return "tense";
  if (preview || isClosingWindow(remaining)) return "day";
  return "open";
}

export function closeSrLabel(remaining: number) {
  if (remaining <= 0) return "La encuesta cerró.";
  if (remaining <= CLOSE_CRITICAL_MS) {
    if (remaining <= HOUR_MS) {
      const mins = Math.max(1, Math.ceil(remaining / 60_000));
      return mins === 1 ? "Cierra ahora, queda 1 minuto." : `Cierra ahora, quedan ${mins} minutos.`;
    }
    const hours = Math.max(1, Math.ceil(remaining / HOUR_MS));
    return hours === 1 ? "Cierra ahora, queda 1 hora." : `Cierra ahora, quedan ${hours} horas.`;
  }
  const hours = Math.max(1, Math.ceil(remaining / HOUR_MS));
  return hours === 1 ? "Cierra hoy, queda 1 hora." : `Cierra hoy, quedan ${hours} horas.`;
}

export function formatRemainingClock(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  return `${pad2(hours)}:${pad2(mins)}:${pad2(secs)}`;
}

export const PREVIEW_CLOSE_REAL_MS = 60_000;
export const PREVIEW_CLOSE_PAUSE_MS = 1_800;

export function previewCloseRemaining(startedAt: number, now = Date.now()) {
  const elapsed = Math.max(0, now - startedAt);
  if (elapsed >= PREVIEW_CLOSE_REAL_MS) return 0;
  return Math.max(0, Math.round((1 - elapsed / PREVIEW_CLOSE_REAL_MS) * DAY_MS));
}

export function elapsedAtRemaining(opensAt: string, closesAt: string, remaining: number) {
  const close = new Date(closesAt).getTime();
  if (!Number.isFinite(close)) return 0;
  return surveyElapsedPct(opensAt, closesAt, close - remaining);
}

export function surveyElapsedPct(opensAt: string, closesAt: string, now = Date.now()) {
  const open = new Date(opensAt).getTime();
  const close = new Date(closesAt).getTime();
  if (!Number.isFinite(open) || !Number.isFinite(close) || close <= open) return 0;
  return Math.min(100, Math.max(0, ((now - open) / (close - open)) * 100));
}

export function todaySharePct(votesLast24h: number, totalVotes: number) {
  if (!totalVotes) return 0;
  return (votesLast24h / totalVotes) * 100;
}

export function boardNow(generatedAt: string | undefined, age = 0) {
  const base = generatedAt ? Date.parse(generatedAt) : NaN;
  return Number.isFinite(base) ? base + age * 1000 : 0;
}

export function closeTimeLeftPct(remaining: number) {
  if (remaining <= 0) return 0;
  if (remaining >= DAY_MS) return 100;
  return (remaining / DAY_MS) * 100;
}

export function cssPct(value: number, min = 0) {
  const n = Math.min(100, Math.max(min, value));
  return `${n.toFixed(1)}%`;
}

export function normalizeHourlyActivity(raw: unknown): number[] {
  const arr = Array.isArray(raw) ? raw.map((n) => Number(n) || 0) : [];
  if (arr.length >= 24) return arr.slice(-24);
  return [...Array(24 - arr.length).fill(0), ...arr];
}

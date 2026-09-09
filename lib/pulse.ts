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

export function daysUntil(iso: string, now = Date.now()) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - now) / 86_400_000));
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

export function cssPct(value: number, min = 0) {
  const n = Math.min(100, Math.max(min, value));
  return `${n.toFixed(1)}%`;
}

export function normalizeHourlyActivity(raw: unknown): number[] {
  const arr = Array.isArray(raw) ? raw.map((n) => Number(n) || 0) : [];
  if (arr.length >= 24) return arr.slice(-24);
  return [...Array(24 - arr.length).fill(0), ...arr];
}

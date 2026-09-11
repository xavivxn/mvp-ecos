const PY: Intl.DateTimeFormatOptions = {
  timeZone: "America/Asuncion",
};

export function formatInt(value: number) {
  return value.toLocaleString("es-PY");
}

export function shortName(name: string) {
  return name.replace(/^(Ing\.|Prof\.|Profe\.)\s+/i, "");
}

export function formatEsList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} y ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

export function formatPct(value: number, digits = 1) {
  return `${value.toLocaleString("es-PY", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  })}%`;
}

export function formatPyDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-PY", {
    ...PY,
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatPyDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-PY", {
    ...PY,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

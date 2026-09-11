const PY: Intl.DateTimeFormatOptions = {
  timeZone: "America/Asuncion",
};

export function formatInt(value: number) {
  return value.toLocaleString("es-PY");
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

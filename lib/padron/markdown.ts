export type PadronElector = {
  cedula: string;
  birthDate: string;
  districtCode: string;
  localCode: string | null;
  mesa: string;
};

export type ParsePadronResult = {
  electors: PadronElector[];
  skipped: number;
  districtCode: string | null;
  localCode: string | null;
};

const ROW_RE = /^\|(\d+)\|(\d+)\|([^|]+)\|/;
const DATE_RE = /(\d{2})\/(\d{2})\/(\d{4})/;

function districtFromHeader(raw: string) {
  const value = raw.replace(/\s+/g, " ").trim().toUpperCase();
  const dash = value.lastIndexOf("-");
  return (dash >= 0 ? value.slice(dash + 1) : value).trim();
}

function localFromHeader(raw: string) {
  const value = raw.replace(/\s+/g, " ").trim();
  const cut = value.split(" - ")[0]?.trim() || value;
  return cut.toUpperCase();
}

function parseBirthDate(raw: string) {
  const match = raw.match(DATE_RE);
  if (!match) return null;
  return `${match[3]}-${match[2]}-${match[1]}`;
}

export function parsePadronMarkdown(text: string): ParsePadronResult {
  const electors: PadronElector[] = [];
  let skipped = 0;
  let districtCode: string | null = null;
  let localCode: string | null = null;

  for (const line of text.split(/\r?\n/)) {
    const districtMatch = line.match(/\*\*Distrito:\*\*\s*([^*\n]+)/i);
    if (districtMatch) districtCode = districtFromHeader(districtMatch[1]);

    const localMatch = line.match(/\*\*Local:\*\*\s*([^*\n]+)/i);
    if (localMatch) localCode = localFromHeader(localMatch[1]);

    const row = line.match(ROW_RE);
    if (!row) continue;

    const mesa = row[1];
    const cedula = row[3].replace(/\D/g, "");
    const birthDate = parseBirthDate(line);

    if (cedula.length < 5 || cedula.length > 10 || !birthDate || !districtCode) {
      skipped += 1;
      continue;
    }

    electors.push({
      cedula,
      birthDate,
      districtCode,
      localCode,
      mesa,
    });
  }

  return { electors, skipped, districtCode, localCode };
}

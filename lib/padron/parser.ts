import { load } from "cheerio";

export type PadronParseStatus =
  | "eligible"
  | "not_found"
  | "waf_blocked"
  | "unknown";

export type PadronParseResult = {
  status: PadronParseStatus;
  districtCode: string | null;
  department: string | null;
  mesa: string | null;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function cell($: ReturnType<typeof load>, labels: string[]) {
  const wanted = labels.map(normalize);
  let found: string | null = null;

  $("dt").each((_, el) => {
    const label = normalize($(el).text());
    if (wanted.includes(label)) {
      found = $(el).next("dd").text().replace(/\s+/g, " ").trim() || null;
    }
  });

  if (found) return found;

  $("th, td, span, p, li, div").each((_, el) => {
    const text = normalize($(el).text());
    for (const label of wanted) {
      if (text.startsWith(`${label}:`) || text.startsWith(`${label} `)) {
        const raw = $(el).text().split(":").slice(1).join(":").trim();
        if (raw) found = raw.replace(/\s+/g, " ").trim();
      }
    }
  });

  return found;
}

export function parsePadronHtml(html: string): PadronParseResult {
  const lowered = html.toLowerCase();

  if (
    lowered.includes("sucuri") ||
    lowered.includes("access denied") ||
    lowered.includes("verify you're human") ||
    lowered.includes("verify you\u2019re human")
  ) {
    return {
      status: "waf_blocked",
      districtCode: null,
      department: null,
      mesa: null,
    };
  }

  const $ = load(html);
  const resultText = normalize(
    $("#resultadoConsulta").text() || $("main").text() || $("body").text(),
  );

  const notFound =
    resultText.includes("NO SE ENCONTRARON") ||
    resultText.includes("NO EXISTE") ||
    resultText.includes("SIN RESULTADOS") ||
    resultText.includes("NO FIGURA") ||
    resultText.includes("NO HABILITADO");

  const districtCode = cell($, ["Distrito", "Distrito electoral"]);
  const department = cell($, ["Departamento"]);
  const mesa = cell($, ["Mesa", "Nro. de mesa", "Numero de mesa"]);

  if (notFound && !districtCode && !mesa) {
    return {
      status: "not_found",
      districtCode: null,
      department: null,
      mesa: null,
    };
  }

  if (districtCode || mesa || department) {
    return {
      status: "eligible",
      districtCode: districtCode ? normalize(districtCode) : null,
      department: department ? normalize(department) : null,
      mesa,
    };
  }

  return {
    status: "unknown",
    districtCode: null,
    department: null,
    mesa: null,
  };
}

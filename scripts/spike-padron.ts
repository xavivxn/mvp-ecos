import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePadronMarkdown } from "../lib/padron/markdown";

const EXPECTED_TOTAL = 24_643;
const here = dirname(fileURLToPath(import.meta.url));
const padronDir = join(here, "..", "data", "padron");

function main() {
  const files = readdirSync(padronDir)
    .filter((name) => name.toLowerCase().endsWith(".md") && name !== "README.md")
    .sort();

  if (!files.length) {
    throw new Error(`No hay markdown en ${padronDir}`);
  }

  const cedulas = new Set<string>();
  let skipped = 0;

  for (const file of files) {
    const parsed = parsePadronMarkdown(readFileSync(join(padronDir, file), "utf8"));
    skipped += parsed.skipped;
    const uniqueInFile = new Set(parsed.electors.map((row) => row.cedula));
    console.log(
      `${file}: ${parsed.electors.length} filas / ${uniqueInFile.size} cédulas · ${parsed.localCode ?? "?"} · ${parsed.districtCode ?? "?"}`,
    );
    for (const row of parsed.electors) cedulas.add(row.cedula);
  }

  console.log(`Total único: ${cedulas.size} · omitidas: ${skipped} · esperado: ${EXPECTED_TOTAL}`);
  if (cedulas.size !== EXPECTED_TOTAL) {
    throw new Error(`El padrón parseado no coincide con ${EXPECTED_TOTAL} electores.`);
  }
}

main();

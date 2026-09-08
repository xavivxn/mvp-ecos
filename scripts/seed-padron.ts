import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { rpc } from "../lib/db";
import { parsePadronMarkdown } from "../lib/padron/markdown";
import { hashBirthDate, hashCedula } from "../lib/security/hash";

const BATCH_SIZE = 500;
const here = dirname(fileURLToPath(import.meta.url));
const padronDir = join(here, "..", "data", "padron");

type SeedRow = {
  cedula_hash: string;
  birth_date_hash: string;
  district_code: string;
  local_code: string | null;
  mesa: string;
};

async function main() {
  const files = readdirSync(padronDir)
    .filter((name) => name.toLowerCase().endsWith(".md") && name !== "README.md")
    .sort();

  if (!files.length) {
    throw new Error(`No hay markdown en ${padronDir}`);
  }

  const byCedula = new Map<string, SeedRow>();
  let skipped = 0;

  for (const file of files) {
    const parsed = parsePadronMarkdown(readFileSync(join(padronDir, file), "utf8"));
    skipped += parsed.skipped;
    console.log(
      `${file}: ${parsed.electors.length} electores · local=${parsed.localCode ?? "?"} · distrito=${parsed.districtCode ?? "?"}`,
    );

    for (const elector of parsed.electors) {
      byCedula.set(elector.cedula, {
        cedula_hash: hashCedula(elector.cedula),
        birth_date_hash: hashBirthDate(elector.birthDate),
        district_code: elector.districtCode,
        local_code: elector.localCode,
        mesa: elector.mesa,
      });
    }
  }

  const rows = [...byCedula.values()];
  console.log(`Únicos a cargar: ${rows.length} · filas omitidas: ${skipped}`);

  let upserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const count = await rpc<number>("app_seed_padron_batch", { p_rows: batch });
    upserted += Number(count ?? 0);
    console.log(`Lote ${Math.floor(i / BATCH_SIZE) + 1}: ${count} filas`);
  }

  console.log(`Seed listo. Upserts: ${upserted}. Total único: ${rows.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parsePadronHtml } from "../lib/padron/parser";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");

function load(name: string) {
  return readFileSync(join(root, "lib/padron/fixtures", name), "utf8");
}

async function main() {
  const started = Date.now();
  const cases = [
    ["found.html", "eligible"],
    ["not-found.html", "not_found"],
    ["waf.html", "waf_blocked"],
  ] as const;

  let failed = 0;
  for (const [file, expected] of cases) {
    const got = parsePadronHtml(load(file)).status;
    const ok = got === expected;
    if (!ok) failed += 1;
    console.log(`${ok ? "OK" : "FAIL"} ${file}: ${got} (esperado ${expected})`);
    if (file === "found.html") {
      const parsed = parsePadronHtml(load(file));
      console.log("  distrito:", parsed.districtCode, "depto:", parsed.department);
    }
  }

  const liveEnabled = process.env.SPIKE_LIVE === "1";
  if (liveEnabled) {
    const t0 = Date.now();
    const res = await fetch("https://padron.tsje.gov.py/", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();
    const live = parsePadronHtml(html);
    console.log(
      `LIVE GET padron.tsje.gov.py → HTTP ${res.status} en ${Date.now() - t0}ms · parse=${live.status}`,
    );
  } else {
    console.log("LIVE GET omitido (set SPIKE_LIVE=1 para probar conectividad).");
  }
  console.log(
    "Conclusión: sin cookie WAF el servidor recibe bloqueo Sucuri. Fuente primaria para producción: cookie reutilizada + Chromium de respaldo. MVP usa PADRON_MODE=mock.",
  );
  console.log(`Spike total ${Date.now() - started}ms`);
  if (failed) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

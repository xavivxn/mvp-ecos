import { lookupPadron } from "../lib/padron";
import { env } from "../lib/env";
import { hashCedula } from "../lib/security/hash";

const cases = [
  ["habilitado", "3433693", "1979-12-30", true],
  ["fecha incorrecta", "3433693", "1979-12-31", false],
  ["inexistente", "1111111", "1990-01-01", false],
] as const;

async function main() {
  if (env.padronMode !== "db") {
    throw new Error("Este check requiere PADRON_MODE=db");
  }
  for (const [label, cedula, birthDate, expectEligible] of cases) {
    const result = await lookupPadron(cedula, hashCedula(cedula), birthDate);
    const eligible = result.ok && result.eligible;
    const ok = eligible === expectEligible;
    const extra =
      result.ok && result.eligible
        ? ` distrito=${result.districtCode} local=${result.localCode} mesa=${result.mesa}`
        : result.ok
          ? ` source=${result.source}`
          : ` error=${result.code}`;
    console.log(`${ok ? "OK" : "FAIL"} ${label}: eligible=${eligible}${extra}`);
    if (!ok) process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

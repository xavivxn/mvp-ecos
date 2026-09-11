import { lookupPadron } from "../lib/padron";
import { env } from "../lib/env";
import { hashCedula } from "../lib/security/hash";

function bumpDay(iso: string) {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

async function main() {
  if (env.padronMode !== "db") {
    throw new Error("Este check requiere PADRON_MODE=db");
  }

  const cedula = process.env.CHECK_PADRON_CEDULA?.replace(/\D/g, "") ?? "";
  const birthDate = process.env.CHECK_PADRON_DOB?.trim() ?? "";

  const cases: [string, string, string, boolean][] = [
    ["inexistente", "1111111", "1990-01-01", false],
  ];

  if (cedula && birthDate) {
    cases.unshift(
      ["habilitado", cedula, birthDate, true],
      ["fecha incorrecta", cedula, bumpDay(birthDate), false],
    );
  } else {
    console.log("Sin CHECK_PADRON_CEDULA / CHECK_PADRON_DOB: solo se prueba cédula inexistente.");
  }

  for (const [label, ci, dob, expectEligible] of cases) {
    const result = await lookupPadron(ci, hashCedula(ci), dob);
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

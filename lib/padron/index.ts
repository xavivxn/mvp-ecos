import { env } from "@/lib/env";
import { rpc } from "@/lib/db";
import { hashBirthDate } from "@/lib/security/hash";

export type PadronLookup =
  | {
      ok: true;
      eligible: true;
      districtCode: string | null;
      localCode: string | null;
      mesa: string | null;
      source: string;
    }
  | { ok: true; eligible: false; districtCode: null; source: string }
  | { ok: false; code: "padron_unavailable" };

function mockLookup(cedula: string): PadronLookup {
  const reject = (process.env.PADRON_MOCK_REJECT ?? "9999999")
    .split(",")
    .map((v) => v.trim());

  if (reject.includes(cedula)) {
    return { ok: true, eligible: false, districtCode: null, source: "mock" };
  }

  return {
    ok: true,
    eligible: true,
    districtCode: (process.env.PADRON_MOCK_DISTRICT ?? "YAGUARON").toUpperCase(),
    localCode: null,
    mesa: null,
    source: "mock",
  };
}

export async function lookupPadron(
  cedula: string,
  cedulaHash: string,
  birthDate: string,
): Promise<PadronLookup> {
  if (env.padronMode === "mock") {
    return mockLookup(cedula);
  }

  try {
    const row = await rpc<{
      eligible: boolean;
      districtCode: string | null;
      localCode: string | null;
      mesa: string | null;
    } | null>("app_lookup_padron", {
      p_cedula_hash: cedulaHash,
      p_birth_date_hash: hashBirthDate(birthDate),
    });

    if (!row?.eligible) {
      return { ok: true, eligible: false, districtCode: null, source: "db" };
    }

    return {
      ok: true,
      eligible: true,
      districtCode: row.districtCode,
      localCode: row.localCode,
      mesa: row.mesa,
      source: "db",
    };
  } catch {
    return { ok: false, code: "padron_unavailable" };
  }
}

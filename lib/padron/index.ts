import { env } from "@/lib/env";
import { rpc } from "@/lib/db";
import { parsePadronHtml } from "./parser";
import { fetchPadronWithCookies } from "./fetcher";
import { fetchPadronWithBrowser } from "./browser";

export type PadronLookup =
  | { ok: true; eligible: true; districtCode: string | null; source: string }
  | { ok: true; eligible: false; districtCode: null; source: string }
  | { ok: false; code: "tsje_unavailable" };

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
    source: "mock",
  };
}

export async function lookupPadron(cedula: string, cedulaHash: string): Promise<PadronLookup> {
  const cached = await rpc<{
    eligible: boolean;
    districtCode: string | null;
    source: string;
  } | null>("app_get_padron_cache", { p_cedula_hash: cedulaHash });

  if (cached) {
    if (!cached.eligible) {
      return { ok: true, eligible: false, districtCode: null, source: `cache:${cached.source}` };
    }
    return {
      ok: true,
      eligible: true,
      districtCode: cached.districtCode,
      source: `cache:${cached.source}`,
    };
  }

  if (env.padronMode === "mock") {
    const result = mockLookup(cedula);
    if (result.ok) {
      await rpc("app_upsert_padron_cache", {
        p_cedula_hash: cedulaHash,
        p_eligible: result.eligible,
        p_district_code: result.eligible ? result.districtCode : null,
        p_source: "mock",
      });
    }
    return result;
  }

  const fromCookies = await fetchPadronWithCookies(cedula);
  let parsed = fromCookies.ok ? fromCookies.parsed : null;

  if (!fromCookies.ok) {
    try {
      const browser = await fetchPadronWithBrowser(cedula);
      parsed = browser.parsed;
      if (browser.cookieHeader && parsed.status !== "waf_blocked") {
        await rpc("app_set_waf_cookies", {
          p_cookie_header: browser.cookieHeader,
          p_expires_at: new Date(Date.now() + 1000 * 60 * 25).toISOString(),
        });
      }
    } catch {
      return { ok: false, code: "tsje_unavailable" };
    }
  }

  if (!parsed || parsed.status === "waf_blocked" || parsed.status === "unknown") {
    return { ok: false, code: "tsje_unavailable" };
  }

  const eligible = parsed.status === "eligible";
  await rpc("app_upsert_padron_cache", {
    p_cedula_hash: cedulaHash,
    p_eligible: eligible,
    p_district_code: parsed.districtCode,
    p_source: "tsje",
  });

  if (!eligible) {
    return { ok: true, eligible: false, districtCode: null, source: "tsje" };
  }

  return {
    ok: true,
    eligible: true,
    districtCode: parsed.districtCode,
    source: "tsje",
  };
}

export { parsePadronHtml };

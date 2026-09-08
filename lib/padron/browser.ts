import type { PadronParseResult } from "./parser";

export async function fetchPadronWithBrowser(cedula: string): Promise<{
  parsed: PadronParseResult;
  cookieHeader: string | null;
  elapsedMs: number;
}> {
  void cedula;
  if (process.env.PADRON_BROWSER !== "1") {
    throw new Error("BROWSER_DISABLED");
  }

  throw new Error(
    "Chromium no está empaquetado en el MVP de Vercel. Usá cookie WAF reutilizada o un worker externo.",
  );
}

import { parsePadronHtml } from "./parser";
import { rpc } from "@/lib/db";

const PADRON_URL = "https://padron.tsje.gov.py/";
const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

function extractCsrf(html: string) {
  const match = html.match(/name=["']csrf_token["'][^>]*value=["']([^"']+)["']/i)
    || html.match(/value=["']([^"']+)["'][^>]*name=["']csrf_token["']/i);
  return match?.[1] ?? null;
}

export async function fetchPadronWithCookies(cedula: string) {
  const stored = await rpc<{ cookieHeader: string; expiresAt: string } | null>(
    "app_get_waf_cookies",
    {},
  );

  const cookieHeader = stored?.cookieHeader;
  if (!cookieHeader) {
    return { ok: false as const, reason: "no_cookie" as const };
  }

  const getRes = await fetch(PADRON_URL, {
    headers: {
      "User-Agent": USER_AGENT,
      Cookie: cookieHeader,
      Accept: "text/html",
    },
    cache: "no-store",
  });

  const getHtml = await getRes.text();
  const parsedGet = parsePadronHtml(getHtml);
  if (parsedGet.status === "waf_blocked" || getRes.status === 403) {
    return { ok: false as const, reason: "waf_blocked" as const };
  }

  const csrf = extractCsrf(getHtml);
  if (!csrf) {
    return { ok: false as const, reason: "no_csrf" as const };
  }

  const body = new URLSearchParams({ csrf_token: csrf, cedula });
  const postRes = await fetch(PADRON_URL, {
    method: "POST",
    headers: {
      "User-Agent": USER_AGENT,
      Cookie: cookieHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      Origin: "https://padron.tsje.gov.py",
      Referer: PADRON_URL,
    },
    body,
    cache: "no-store",
  });

  const html = await postRes.text();
  const parsed = parsePadronHtml(html);
  if (parsed.status === "waf_blocked" || postRes.status === 403) {
    return { ok: false as const, reason: "waf_blocked" as const };
  }

  return { ok: true as const, parsed, html };
}

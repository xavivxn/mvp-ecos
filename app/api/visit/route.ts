import { NextRequest } from "next/server";
import { rpc } from "@/lib/db";
import { hashVisitor, randomToken } from "@/lib/security/hash";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const existing = request.cookies.get("ecos_vid")?.value;
  const visitorId = existing || randomToken(18);
  await rpc("app_record_visit", { p_visitor_hash: hashVisitor(visitorId) });

  const response = Response.json({ ok: true });
  if (!existing) {
    const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
    response.headers.append(
      "Set-Cookie",
      `ecos_vid=${visitorId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`,
    );
  }
  return response;
}

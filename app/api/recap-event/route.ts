import { NextRequest } from "next/server";
import { z } from "zod";
import { rpc } from "@/lib/db";
import { env } from "@/lib/env";
import { recapEventSchema } from "@/lib/recap";
import { hashVisitor, randomToken } from "@/lib/security/hash";
import { jsonError } from "@/lib/security/request";

export const runtime = "nodejs";

const bodySchema = z.object({ event: recapEventSchema });

function rateWindow(event: string) {
  if (event === "recap_view") return { limit: 40, windowSeconds: 3600 };
  return { limit: 20, windowSeconds: 600 };
}

export async function POST(request: NextRequest) {
  if (env.forceSurveyClosed) {
    return Response.json({ ok: true });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Solicitud inválida.", 400);
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Evento inválido.", 400);
  }

  const existing = request.cookies.get("ecos_vid")?.value;
  const visitorId = existing || randomToken(18);
  const visitorHash = hashVisitor(visitorId);
  const { event } = parsed.data;
  const { limit, windowSeconds } = rateWindow(event);
  const family = event === "recap_view" ? "view" : event.startsWith("invite_share_") ? "invite" : "share";

  const allowed = await rpc<boolean>("app_check_rate_limit", {
    p_key: `recap:${family}:${visitorHash}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });

  if (allowed) {
    await rpc("app_record_recap_event", {
      p_visitor_hash: visitorHash,
      p_event: event,
    });
  }

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

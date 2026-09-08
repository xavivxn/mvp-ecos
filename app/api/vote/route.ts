import { NextRequest } from "next/server";
import { voteSchema } from "@/lib/types";
import { rpc } from "@/lib/db";
import { hashIp, hashUa } from "@/lib/security/hash";
import { verifyVoteToken } from "@/lib/security/token";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp, jsonError } from "@/lib/security/request";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Solicitud inválida.", 400);
  }

  const parsed = voteSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("El voto está incompleto.", 400);
  }

  const ip = clientIp(request);
  const allowed = await rpc<boolean>("app_check_rate_limit", {
    p_key: `vote:ip:${hashIp(ip)}`,
    p_limit: 8,
    p_window_seconds: 600,
  });
  if (!allowed) {
    return jsonError("Demasiados intentos. Probá de nuevo en unos minutos.", 429);
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return jsonError("No pudimos validar el envío. Recargá e intentá de nuevo.", 403);
  }

  const token = verifyVoteToken(parsed.data.token);
  if (!token) {
    return jsonError("La verificación expiró. Volvé a validar tu cédula.", 401, "invalid_session");
  }

  const result = await rpc<{ ok: boolean; code?: string }>("app_cast_vote", {
    p_session_id: token.sid,
    p_cedula_hash: token.ch,
    p_intendente: parsed.data.intendente,
    p_concejal: parsed.data.concejal,
    p_ip_hash: hashIp(ip),
    p_ua_hash: hashUa(request.headers.get("user-agent") || "unknown"),
  });

  if (!result?.ok) {
    const map: Record<string, [string, number]> = {
      already_voted: ["Esta cédula ya registró su intención de voto.", 409],
      session_used: ["Esta verificación ya fue utilizada.", 409],
      session_expired: ["La verificación expiró. Volvé a validar tu cédula.", 401],
      invalid_session: ["La verificación no es válida.", 401],
      closed: ["La encuesta está cerrada.", 403],
      invalid_choice: ["La opción seleccionada no es válida.", 400],
      wrong_district: ["Esta encuesta no corresponde a tu distrito.", 403],
    };
    const [message, status] = map[result?.code ?? ""] ?? ["No se pudo registrar el voto.", 400];
    return jsonError(message, status, result?.code);
  }

  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = Response.json({ ok: true });
  response.headers.append(
    "Set-Cookie",
    `ecos_voted=1; Path=/; HttpOnly; SameSite=Strict; Max-Age=31536000${secure}`,
  );
  return response;
}

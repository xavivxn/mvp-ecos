import { NextRequest } from "next/server";
import { verifySchema } from "@/lib/types";
import { rpc } from "@/lib/db";
import { hashCedula, hashIp } from "@/lib/security/hash";
import { signVoteToken } from "@/lib/security/token";
import { verifyTurnstile } from "@/lib/security/turnstile";
import { clientIp, jsonError } from "@/lib/security/request";
import { lookupPadron } from "@/lib/padron";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Solicitud inválida.", 400);
  }

  const parsed = verifySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError("Revisá el número de cédula y la fecha de nacimiento.", 400);
  }

  const ip = clientIp(request);
  const allowed = await rpc<boolean>("app_check_rate_limit", {
    p_key: `verify:ip:${hashIp(ip)}`,
    p_limit: 10,
    p_window_seconds: 600,
  });
  if (!allowed) {
    return jsonError("Demasiados intentos. Probá de nuevo en unos minutos.", 429);
  }

  const cedulaHash = hashCedula(parsed.data.cedula);
  const cedulaAllowed = await rpc<boolean>("app_check_rate_limit", {
    p_key: `verify:ci:${cedulaHash}`,
    p_limit: 5,
    p_window_seconds: 3600,
  });
  if (!cedulaAllowed) {
    return jsonError("Demasiados intentos. Probá de nuevo en unos minutos.", 429);
  }

  const human = await verifyTurnstile(parsed.data.turnstileToken, ip);
  if (!human) {
    return jsonError("No pudimos validar la consulta. Recargá e intentá de nuevo.", 403);
  }

  const election = await rpc<{
    id: string;
    isOpen: boolean;
    districtCode: string | null;
  } | null>("app_get_active_election");

  if (!election) return jsonError("No hay una encuesta activa.", 503);
  if (!election.isOpen) return jsonError("La encuesta está cerrada.", 403, "closed");

  const already = await rpc<boolean>("app_has_voted", {
    p_election_id: election.id,
    p_cedula_hash: cedulaHash,
  });
  if (already) {
    return jsonError("Esta cédula ya registró su intención de voto.", 409, "already_voted");
  }

  const padron = await lookupPadron(
    parsed.data.cedula,
    cedulaHash,
    parsed.data.fechaNacimiento,
  );
  if (!padron.ok) {
    return jsonError(
      "No pudimos consultar el padrón en este momento. Intentá más tarde.",
      503,
      "padron_unavailable",
    );
  }
  if (!padron.eligible) {
    return jsonError("No encontramos esta cédula habilitada en el padrón.", 403, "not_eligible");
  }

  if (env.allowedDistrict && padron.districtCode && padron.districtCode !== env.allowedDistrict) {
    return jsonError("Esta encuesta es solo para electores del distrito configurado.", 403, "wrong_district");
  }

  const expires = new Date(Date.now() + 10 * 60 * 1000);
  const sessionId = await rpc<string>("app_create_session", {
    p_election_id: election.id,
    p_cedula_hash: cedulaHash,
    p_district_code: padron.districtCode,
    p_expires_at: expires.toISOString(),
  });

  const token = signVoteToken({
    sid: sessionId,
    ch: cedulaHash,
    exp: Math.floor(expires.getTime() / 1000),
    d: padron.districtCode,
  });

  return Response.json({
    ok: true,
    token,
    expiresAt: expires.toISOString(),
    district: padron.districtCode,
    demo: env.padronMode === "mock",
  });
}

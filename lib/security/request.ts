import { NextRequest } from "next/server";

export function clientIp(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "0.0.0.0";
  return request.headers.get("x-real-ip") || "0.0.0.0";
}

export function jsonError(message: string, status: number, code?: string) {
  return Response.json({ ok: false, error: message, code }, { status });
}

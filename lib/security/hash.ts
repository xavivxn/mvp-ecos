import { createHmac, randomBytes, createHash, timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

export function hmacHex(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function hashCedula(cedula: string) {
  return hmacHex(env.cedulaHmacSecret, cedula);
}

export function hashBirthDate(isoDate: string) {
  return hmacHex(env.cedulaHmacSecret, `dob:${isoDate}`);
}

export function hashVisitor(id: string) {
  return hmacHex(env.cedulaHmacSecret, `visitor:${id}`);
}

export function hashIp(ip: string) {
  return hmacHex(env.cedulaHmacSecret, `ip:${ip}`);
}

export function hashUa(ua: string) {
  return sha256Hex(ua).slice(0, 32);
}

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function safeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

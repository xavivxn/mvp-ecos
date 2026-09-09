import { env } from "@/lib/env";

export async function verifyTurnstile(token: string, ip: string) {
  if (!env.turnstileSecretKey) {
    return true;
  }

  const body = new URLSearchParams({
    secret: env.turnstileSecretKey,
    response: token,
    remoteip: ip,
  });

  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body,
  });

  if (!res.ok) return false;
  const data = (await res.json()) as { success?: boolean };
  return data.success === true;
}

import { z } from "zod";
import { hmacHex, safeEqual } from "./hash";
import { env } from "@/lib/env";

const payloadSchema = z.object({
  sid: z.string().uuid(),
  ch: z.string().min(16),
  exp: z.number(),
  d: z.string().nullable(),
});

export type VoteTokenPayload = z.infer<typeof payloadSchema>;

export function signVoteToken(payload: VoteTokenPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = hmacHex(env.voteTokenSecret, body);
  return `${body}.${sig}`;
}

export function verifyVoteToken(token: string): VoteTokenPayload | null {
  const [body, sig] = token.split(".");
  if (!body || !sig) return null;
  const expected = hmacHex(env.voteTokenSecret, body);
  if (!safeEqual(sig, expected)) return null;

  try {
    const parsed = payloadSchema.parse(JSON.parse(Buffer.from(body, "base64url").toString("utf8")));
    if (parsed.exp * 1000 < Date.now()) return null;
    return parsed;
  } catch {
    return null;
  }
}

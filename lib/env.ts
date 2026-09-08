function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

/**
 * Lazy getters: Next evalúa las API routes al hacer `next build`.
 * En Vercel los secretos suelen existir en runtime, no siempre en compile.
 */
export const env = {
  get supabaseUrl() {
    return required("SUPABASE_URL");
  },
  get supabaseAnonKey() {
    return required("SUPABASE_ANON_KEY");
  },
  get appRpcSecret() {
    return required("APP_RPC_SECRET");
  },
  get cedulaHmacSecret() {
    return required("CEDULA_HMAC_SECRET");
  },
  get voteTokenSecret() {
    return required("VOTE_TOKEN_SECRET");
  },
  get padronMode() {
    return (process.env.PADRON_MODE === "live" ? "live" : "mock") as "live" | "mock";
  },
  get turnstileSecretKey() {
    return process.env.TURNSTILE_SECRET_KEY || "";
  },
  get turnstileSiteKey() {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  },
  get allowedDistrict() {
    return process.env.PADRON_ALLOWED_DISTRICT?.toUpperCase() || "";
  },
};

export const publicEnv = {
  get turnstileSiteKey() {
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  },
  get padronMode() {
    return (process.env.PADRON_MODE === "live" ? "live" : "mock") as "live" | "mock";
  },
};

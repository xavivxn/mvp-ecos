function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

/** Dummy keys de Cloudflare: el widget real no autoriza localhost (error 110200). */
const TURNSTILE_DUMMY_SITE_KEY = "1x00000000000000000000AA";
const TURNSTILE_DUMMY_SECRET_KEY = "1x0000000000000000000000000000000AA";

function useDummyTurnstile() {
  return process.env.NODE_ENV === "development";
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
    const mode = process.env.PADRON_MODE;
    return mode === "db" || mode === "live" ? "db" : "mock";
  },
  get turnstileSecretKey() {
    if (useDummyTurnstile()) return TURNSTILE_DUMMY_SECRET_KEY;
    return process.env.TURNSTILE_SECRET_KEY || "";
  },
  get turnstileSiteKey() {
    if (useDummyTurnstile()) return TURNSTILE_DUMMY_SITE_KEY;
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  },
  get allowedDistrict() {
    return process.env.PADRON_ALLOWED_DISTRICT?.toUpperCase() || "";
  },
  get allowRepeatVotes() {
    const value = process.env.ALLOW_REPEAT_VOTES?.trim().toLowerCase();
    return value === "true" || value === "1";
  },
  get forceSurveyClosed() {
    const value = process.env.FORCE_SURVEY_CLOSED?.trim().toLowerCase();
    if (value !== "true" && value !== "1") return false;
    return process.env.VERCEL_ENV !== "production";
  },
};

export const publicEnv = {
  get turnstileSiteKey() {
    if (useDummyTurnstile()) return TURNSTILE_DUMMY_SITE_KEY;
    return process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";
  },
  get padronMode() {
    const mode = process.env.PADRON_MODE;
    return mode === "db" || mode === "live" ? "db" : "mock";
  },
};

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Falta la variable de entorno ${name}`);
  return value;
}

export const env = {
  supabaseUrl: required("SUPABASE_URL"),
  supabaseAnonKey: required("SUPABASE_ANON_KEY"),
  appRpcSecret: required("APP_RPC_SECRET"),
  cedulaHmacSecret: required("CEDULA_HMAC_SECRET"),
  voteTokenSecret: required("VOTE_TOKEN_SECRET"),
  padronMode: (process.env.PADRON_MODE === "live" ? "live" : "mock") as "live" | "mock",
  turnstileSecretKey: process.env.TURNSTILE_SECRET_KEY || "",
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  allowedDistrict: process.env.PADRON_ALLOWED_DISTRICT?.toUpperCase() || "",
};

export const publicEnv = {
  turnstileSiteKey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "",
  padronMode: (process.env.PADRON_MODE === "live" ? "live" : "mock") as "live" | "mock",
};

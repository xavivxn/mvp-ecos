import { supabaseAdmin } from "@/lib/supabase/server";
import { env } from "@/lib/env";

type RpcName =
  | "app_check_rate_limit"
  | "app_get_active_election"
  | "app_list_candidates"
  | "app_has_voted"
  | "app_lookup_padron"
  | "app_seed_padron_batch"
  | "app_create_session"
  | "app_cast_vote"
  | "app_get_results"
  | "app_record_visit"
  | "app_record_recap_event";

export async function rpc<T>(name: RpcName, args: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabaseAdmin().rpc(name, {
    p_secret: env.appRpcSecret,
    ...args,
  });

  if (error) {
    throw new Error(`${name}: ${error.message}`);
  }

  return data as T;
}

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

// Service-role client: bypasses RLS. Server and scripts only, never import from client components.
export function createAdminClient() {
  const config = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!config || !serviceKey) return null;
  return createClient(config.url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
}

// Cookie-free client for public data, usable inside "use cache" functions.
export function createPublicClient() {
  const config = getSupabaseConfig();
  if (!config) return null;
  return createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false } });
}

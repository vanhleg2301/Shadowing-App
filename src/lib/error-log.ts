import { createAdminClient } from "./supabase/admin";

export interface ServerErrorRecord {
  error: unknown;
  path: string;
  method: string;
  routeType: string;
  routePath: string;
}

// Saves a server error to error_events (migration 023) for Admin -> Errors. The query string is dropped
// (it can hold searches or tokens) and nothing about the visitor is stored. Never throws.
export async function recordServerError({ error, path, method, routeType, routePath }: ServerErrorRecord): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;
  const digest = typeof error === "object" && error !== null && "digest" in error ? String(error.digest) : null;
  try {
    await admin.from("error_events").insert({
      route_type: routeType.slice(0, 20),
      route_path: routePath.slice(0, 200),
      path: path.split("?")[0].slice(0, 300),
      method: method.slice(0, 10),
      message: (error instanceof Error ? `${error.name}: ${error.message}` : String(error)).slice(0, 1000),
      digest: digest?.slice(0, 100) ?? null,
      stack: error instanceof Error && error.stack ? error.stack.slice(0, 4000) : null,
    });
  } catch {
    // Logging must never turn one error into two.
  }
}

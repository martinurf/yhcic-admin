import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/* Service-role client — bypasses Row-Level Security entirely by design.
   Import this ONLY in server-only code (Server Actions, Route Handlers)
   that has already independently verified the caller is an active
   admin. Never import this from a Client Component; never let its
   result cross into anything sent to the browser. This is exactly the
   credential that must never appear in a log, an error message, or a
   response body. */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

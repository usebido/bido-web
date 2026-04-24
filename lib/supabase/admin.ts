/**
 * ⚠️ SERVER-SIDE ONLY
 * Never import this file in Client Components.
 * This client has full database access.
 */
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Admin Supabase client using the service role key.
 *
 * Bypasses Row Level Security — use only from trusted server code (API routes,
 * Server Actions, background jobs) for operations that legitimately need to
 * act on behalf of any user (e.g. sponsor sync, auction settlement).
 */
export function createAdminClient(): SupabaseClient {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for use in Server Components, Route Handlers and Server Actions.
 *
 * Reads/writes Supabase session cookies through Next.js `cookies()` so auth
 * state stays in sync across the request. RLS is enforced.
 *
 * `cookies()` is async in Next.js 15+, so this factory is async as well.
 */
export async function createClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // `set` throws when called from a Server Component. Safe to ignore
            // when middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}

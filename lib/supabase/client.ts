import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase client for use in the BROWSER (Next.js Client Components).
 *
 * Reads the public anon key and URL from env vars. This client respects RLS
 * and is safe to expose to the browser.
 *
 * Use this from any file marked with `"use client"`.
 */
export function createClient(): SupabaseClient {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

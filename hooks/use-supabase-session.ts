"use client";

import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { createClient } from "@/lib/supabase/client";

interface SupabaseSessionState {
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

/**
 * Keeps the Supabase session in sync with the Privy session.
 *
 * Call this once at the top of the app tree (inside a provider). Whenever
 * Privy reports the user as authenticated, we exchange the Privy access
 * token for a Supabase-signed JWT via /api/auth/supabase-token and hand it
 * to `supabase.auth.setSession` so subsequent browser queries carry the
 * authenticated `sub` claim (= privy_id) that RLS expects.
 */
export function useSupabaseSession(): SupabaseSessionState {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [state, setState] = useState<SupabaseSessionState>({
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  useEffect(() => {
    if (!ready) return;

    let cancelled = false;
    const supabase = createClient();

    async function sync() {
      if (!authenticated) {
        await supabase.auth.signOut();
        if (!cancelled) {
          setState({ isLoading: false, isAuthenticated: false, error: null });
        }
        return;
      }

      try {
        const privyToken = await getAccessToken();
        if (!privyToken) throw new Error("Privy did not return an access token");

        const res = await fetch("/api/auth/supabase-token", {
          method: "POST",
          headers: { authorization: `Bearer ${privyToken}` },
        });
        if (!res.ok) {
          throw new Error(`Token exchange failed: ${res.status}`);
        }
        const { supabaseToken } = (await res.json()) as { supabaseToken: string };

        // Supabase-js requires both fields; we have no real refresh flow, so
        // we reuse the access token. The session is short-lived (1h) and this
        // hook re-runs whenever Privy reports a change.
        const { error } = await supabase.auth.setSession({
          access_token: supabaseToken,
          refresh_token: supabaseToken,
        });
        if (error) throw error;

        if (!cancelled) {
          setState({ isLoading: false, isAuthenticated: true, error: null });
        }
      } catch (err) {
        if (!cancelled) {
          setState({
            isLoading: false,
            isAuthenticated: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
      }
    }

    void sync();
    return () => {
      cancelled = true;
    };
  }, [ready, authenticated, getAccessToken]);

  return state;
}

"use client";

import { useSupabaseSession } from "@/hooks/use-supabase-session";
import { useSponsorSync } from "@/hooks/use-sponsor-sync";

/**
 * Runs the two post-login syncs (Supabase JWT handshake, sponsor upsert) in
 * the background. Must live inside <PrivyProvider>. Renders children
 * unchanged — there is no gating UI here on purpose.
 */
export function SyncBridge({ children }: { children: React.ReactNode }) {
  useSupabaseSession();
  useSponsorSync();
  return <>{children}</>;
}

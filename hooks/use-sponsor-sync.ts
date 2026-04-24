"use client";

import { useCallback, useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useWallets as useSolanaWallets } from "@privy-io/react-auth/solana";

export interface Sponsor {
  id: string;
  privy_id: string;
  email: string | null;
  name: string | null;
  wallet_address: string | null;
  balance: number;
  created_at: string;
  updated_at: string;
}

interface SponsorSyncState {
  sponsor: Sponsor | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * After Privy login, upserts the sponsor row for the current user via
 * /api/sponsors/sync and exposes the returned record.
 */
export function useSponsorSync(): SponsorSyncState {
  const { ready, authenticated, getAccessToken, user } = usePrivy();
  const { wallets: solanaWallets } = useSolanaWallets();

  const [sponsor, setSponsor] = useState<Sponsor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const solanaAddress = solanaWallets[0]?.address;
  const privyEmail = user?.email?.address;

  const doSync = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      if (!token) throw new Error("Privy did not return an access token");

      const res = await fetch("/api/sponsors/sync", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: privyEmail,
          walletAddress: solanaAddress,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Sponsor sync failed: ${res.status} ${txt}`);
      }

      setSponsor((await res.json()) as Sponsor);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [getAccessToken, privyEmail, solanaAddress]);

  useEffect(() => {
    if (!ready) return;
    if (!authenticated) {
      setSponsor(null);
      setIsLoading(false);
      return;
    }
    void doSync();
  }, [ready, authenticated, doSync]);

  return { sponsor, isLoading, error, refetch: doSync };
}

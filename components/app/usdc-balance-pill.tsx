"use client";

import { ChevronDown, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { toast } from "sonner";
import {
  DEVNET_CLOAK_FAUCET_URL,
  getDefaultUsdcMintAddress,
  getSolanaNetwork,
  isDevnetNetwork,
} from "@/lib/cloak-config";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_SOLANA_RPC_URL = "https://api.devnet.solana.com";

export function UsdcBalancePill() {
  const { wallets } = useWallets();
  const { formatCurrency, messages } = useI18n();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [refreshTick, setRefreshTick] = useState(0);
  const activeWallet = wallets[0] ?? null;

  useEffect(() => {
    if (!activeWallet?.address) {
      return;
    }

    let cancelled = false;

    async function loadBalance() {
      setLoading(true);

      try {
        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
        const usdcMintAddress =
          process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? getDefaultUsdcMintAddress();
        const connection = new Connection(rpcUrl, "confirmed");
        const owner = new PublicKey(activeWallet.address);
        const mint = new PublicKey(usdcMintAddress);
        const ata = getAssociatedTokenAddressSync(mint, owner, false);
        const tokenBalance = await connection.getTokenAccountBalance(ata, "confirmed").catch(() => null);

        if (!cancelled) {
          setBalance(tokenBalance ? Number(tokenBalance.value.uiAmountString ?? "0") : 0);
        }
      } catch {
        if (!cancelled) {
          setBalance(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadBalance();

    return () => {
      cancelled = true;
    };
  }, [activeWallet?.address, refreshTick]);

  const visibleBalance = activeWallet ? balance : null;
  const visibleLoading = activeWallet ? loading : false;

  async function requestFaucetFunds() {
    if (!activeWallet?.address || reloading) {
      return;
    }

    if (!isDevnetNetwork(getSolanaNetwork())) {
      toast.error(messages.app.usdcBalance.faucetUnavailable);
      return;
    }

    setReloading(true);

    try {
      const response = await fetch(DEVNET_CLOAK_FAUCET_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          wallet: activeWallet.address,
          amount: 100_000_000,
        }),
      });

      if (!response.ok) {
        throw new Error(`Faucet request failed with status ${response.status}`);
      }

      toast.success(messages.app.usdcBalance.faucetSuccess);
      setRefreshTick((current) => current + 1);
    } catch (error) {
      console.error(error);
      toast.error(messages.app.usdcBalance.faucetFailed);
    } finally {
      setReloading(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-semibold tabular-nums text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={messages.app.usdcBalance.dropdownTrigger}
        >
          <span>
            {visibleLoading
              ? "USDC ..."
              : `USDC ${formatCurrency(visibleBalance ?? 0, {
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem
          className="gap-2"
          disabled={!activeWallet?.address || reloading}
          onSelect={(event) => {
            event.preventDefault();
            void requestFaucetFunds();
          }}
        >
          <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
          {reloading ? messages.app.usdcBalance.reloading : messages.app.usdcBalance.reload}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

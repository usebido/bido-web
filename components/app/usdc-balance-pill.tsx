"use client";

import { ChevronDown, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import { useWallets } from "@privy-io/react-auth/solana";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import { useI18n } from "@/components/providers/i18n-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DEFAULT_SOLANA_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export function UsdcBalancePill() {
  const { wallets } = useWallets();
  const { formatCurrency, messages } = useI18n();
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const activeWallet = wallets[0] ?? null;

  useEffect(() => {
    if (!activeWallet?.address) {
      setBalance(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function loadBalance() {
      setLoading(true);

      try {
        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
        const usdcMintAddress = process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? DEFAULT_DEVNET_USDC_MINT;
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
  }, [activeWallet?.address]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-surface px-4 text-xs font-semibold tabular-nums text-foreground transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label={messages.app.usdcBalance.dropdownTrigger}
        >
          <span>
            {loading
              ? "USDC ..."
              : `USDC ${formatCurrency(balance ?? 0, {
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem className="gap-2">
          <Wallet className="size-4 text-muted-foreground" aria-hidden="true" />
          {messages.app.usdcBalance.reload}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

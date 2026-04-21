"use client";

import { useState, useEffect } from "react";
import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Button } from "@/components/ui/button";

interface WalletInfoProps {
  address: string;
}

export default function WalletInfo({ address }: WalletInfoProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const rpcUrl =
      process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    connection
      .getBalance(new PublicKey(address))
      .then((lamports) => setBalance(lamports / LAMPORTS_PER_SOL))
      .catch(() => setBalance(null));
  }, [address]);

  async function copyAddress() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const explorerUrl = `https://explorer.solana.com/address/${address}?cluster=${network}`;

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 flex flex-col gap-3 min-w-[260px]">
      {/* Balance */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">Balance</span>
        <span className="text-sm font-semibold text-white font-mono">
          {balance === null ? (
            <span className="text-zinc-600 animate-pulse">—</span>
          ) : (
            `${balance.toFixed(3)} SOL`
          )}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={copyAddress}
          className="flex-1 border-zinc-700 text-zinc-400 hover:text-white hover:bg-zinc-800 text-xs rounded-lg"
        >
          {copied ? "Copied!" : "Copy Address"}
        </Button>

        <a
          href={explorerUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center text-xs text-zinc-400 hover:text-violet-400 border border-zinc-700 hover:border-violet-700 rounded-lg px-3 py-1.5 transition-colors"
        >
          Explorer ↗
        </a>
      </div>
    </div>
  );
}

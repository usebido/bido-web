"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useWallets } from "@privy-io/react-auth/solana";
import { Button } from "@/components/ui/button";
import WalletInfo from "@/components/wallet-info";

function truncateAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export default function Home() {
  const { ready, authenticated, login, logout, user } = usePrivy();
  const { wallets } = useWallets();

  const solanaWallet = wallets[0];
  const walletAddress = solanaWallet?.address;

  const userLabel =
    user?.email?.address ??
    user?.google?.email ??
    (walletAddress ? truncateAddress(walletAddress) : null);

  return (
    <main className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center gap-2">
          <span className="text-6xl font-black tracking-tighter text-white">
            bid<span className="text-violet-500">o</span>
          </span>
          <span className="text-xs font-semibold tracking-[0.3em] uppercase text-violet-400/70">
            Protocol
          </span>
        </div>

        {/* Tagline */}
        <p className="text-xl text-zinc-400 font-light leading-relaxed max-w-md">
          Real-time intent auctions for the{" "}
          <span className="text-white font-medium">agent economy</span>
        </p>

        {/* Auth area */}
        {!ready ? (
          <div className="h-10 w-40 rounded-lg bg-zinc-800 animate-pulse" />
        ) : authenticated && user ? (
          <div className="flex flex-col items-center gap-4">
            {/* User info card */}
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col items-center gap-2 min-w-[260px]">
              <div className="w-10 h-10 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-sm">
                {userLabel ? userLabel[0].toUpperCase() : "?"}
              </div>
              {userLabel && (
                <span className="text-zinc-300 text-sm font-medium">{userLabel}</span>
              )}
              {walletAddress && (
                <span className="text-zinc-500 text-xs font-mono">
                  {truncateAddress(walletAddress)}
                </span>
              )}
            </div>

            {walletAddress && <WalletInfo address={walletAddress} />}

            <Button
              variant="outline"
              onClick={logout}
              className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500 hover:bg-zinc-800 rounded-xl"
            >
              Disconnect
            </Button>
          </div>
        ) : (
          <Button
            onClick={login}
            className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-8 py-3 rounded-xl text-base transition-all duration-200 shadow-lg shadow-violet-900/30 hover:shadow-violet-700/40"
          >
            Connect Wallet
          </Button>
        )}

        {/* Footer badges */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
            Solana
          </span>
          <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
            Devnet
          </span>
          <span className="text-xs text-zinc-600 bg-zinc-900 border border-zinc-800 rounded-full px-3 py-1">
            v0.1.0
          </span>
        </div>
      </div>
    </main>
  );
}

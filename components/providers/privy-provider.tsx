"use client";

import { PrivyProvider, type PrivyProviderProps } from "@privy-io/react-auth";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";

function toWebsocketUrl(rpcUrl: string) {
  if (rpcUrl.startsWith("https://")) {
    return rpcUrl.replace("https://", "wss://");
  }

  if (rpcUrl.startsWith("http://")) {
    return rpcUrl.replace("http://", "ws://");
  }

  return rpcUrl;
}

type PrivyConfigWithSolanaRpcs = NonNullable<PrivyProviderProps["config"]> & {
  solana: {
    rpcs: Record<
      string,
      {
        rpc: ReturnType<typeof createSolanaRpc>;
        rpcSubscriptions: ReturnType<typeof createSolanaRpcSubscriptions>;
      }
    >;
  };
};

export default function PrivyAppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";
  const chainId = `solana:${network}` as const;
  const config: PrivyConfigWithSolanaRpcs = {
    loginMethods: ["email", "wallet"],
    appearance: {
      theme: "dark",
      accentColor: "#8B5CF6",
      walletChainType: "ethereum-and-solana",
    },
    externalWallets: {
      solana: {
        connectors: toSolanaWalletConnectors(),
      },
    },
    solana: {
      rpcs: {
        [chainId]: {
          rpc: createSolanaRpc(rpcUrl),
          rpcSubscriptions: createSolanaRpcSubscriptions(toWebsocketUrl(rpcUrl)),
        },
      },
    },
    embeddedWallets: {
      solana: {
        createOnLogin: "all-users",
      },
      ethereum: {
        createOnLogin: "off",
      },
    },
  };

  return (
    <PrivyProvider
      appId={appId}
      config={config}
    >
      {children}
    </PrivyProvider>
  );
}

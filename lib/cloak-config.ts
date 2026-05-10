import * as cloakMainnet from "@cloak.dev/sdk";
import * as cloakDevnet from "@cloak.dev/sdk-devnet";

export type CloakSdkModule = typeof import("@cloak.dev/sdk");

export const DEVNET_CLOAK_RELAY_URL = "https://api.devnet.cloak.ag";
export const DEVNET_CLOAK_FAUCET_URL = "https://devnet.cloak.ag/api/faucet";
export const MAINNET_CLOAK_RELAY_URL = "https://api.cloak.ag";
export const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

export function getSolanaNetwork() {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
}

export function isDevnetNetwork(network = getSolanaNetwork()) {
  return network === "devnet";
}

export function getCloakSdk(network = getSolanaNetwork()): CloakSdkModule {
  return isDevnetNetwork(network)
    ? (cloakDevnet as unknown as CloakSdkModule)
    : cloakMainnet;
}

export function getCloakRelayUrl(network = getSolanaNetwork()) {
  return isDevnetNetwork(network) ? DEVNET_CLOAK_RELAY_URL : MAINNET_CLOAK_RELAY_URL;
}

export function getDefaultUsdcMintAddress(network = getSolanaNetwork()) {
  return isDevnetNetwork(network)
    ? cloakDevnet.DEVNET_MOCK_USDC_MINT.toBase58()
    : MAINNET_USDC_MINT;
}

export function getDevnetMockUsdcMintAddress() {
  return cloakDevnet.DEVNET_MOCK_USDC_MINT.toBase58();
}

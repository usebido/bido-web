const MAINNET_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

export function getSolanaNetwork() {
  return process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
}

export function isDevnetNetwork(network = getSolanaNetwork()) {
  return network === "devnet";
}

export function getDefaultUsdcMintAddress(network = getSolanaNetwork()) {
  return isDevnetNetwork(network) ? DEVNET_USDC_MINT : MAINNET_USDC_MINT;
}

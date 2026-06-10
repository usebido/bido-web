import { API_BASE } from "./client";

export type AgentTier = 0 | 1 | 2 | 3;
export const TIER_NAMES = ["new", "established", "trusted", "elite"] as const;

export type AgentTierResponse = {
  agentWallet: string;
  tier: AgentTier;
  tierName: (typeof TIER_NAMES)[number];
  totalPayouts?: number;
  considerationRate30dBps?: number;
  verticalsBitmap?: number;
  anomalyFlags?: number;
  attestationPda?: string;
  expiresAt?: string;
  source: "cache" | "db" | "attestation" | "default";
};

export type AgentAttestationItem = {
  kind: "snapshot" | "milestone" | "tier_change";
  status: "pending" | "confirmed" | "failed" | "closed";
  pda: string;
  txHash: string | null;
  schemaName: string;
  milestoneType: number | null;
  fromTier: number | null;
  toTier: number | null;
  data: Record<string, unknown>;
  createdAt: string;
  expiry: string | null;
};

export type AgentAttestationsResponse = {
  agentWallet: string;
  tier: AgentTier;
  tierName: (typeof TIER_NAMES)[number];
  totalPayouts: number;
  considerationRate30dBps: number;
  verticalsBitmap: number;
  anomalyFlags: number;
  lastSnapshotAt: string | null;
  lastTierChangeAt: string | null;
  attestations: AgentAttestationItem[];
};

export async function fetchAgentTier(wallet: string): Promise<AgentTierResponse> {
  const response = await fetch(`${API_BASE}/agents/${wallet}/tier`, {
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`Tier lookup failed (${response.status})`);
  }
  return (await response.json()) as AgentTierResponse;
}

export async function fetchAgentAttestations(
  wallet: string,
): Promise<AgentAttestationsResponse | null> {
  const response = await fetch(`${API_BASE}/agents/${wallet}/attestations`, {
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Attestations lookup failed (${response.status})`);
  }
  return (await response.json()) as AgentAttestationsResponse;
}

export function explorerAccountUrl(address: string, cluster = "devnet"): string {
  const c = cluster === "mainnet-beta" || cluster === "mainnet" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/address/${address}${c}`;
}

export function explorerTxUrl(signature: string, cluster = "devnet"): string {
  const c = cluster === "mainnet-beta" || cluster === "mainnet" ? "" : `?cluster=${cluster}`;
  return `https://explorer.solana.com/tx/${signature}${c}`;
}

const VERTICAL_BITS: Array<{ label: string; bit: number }> = [
  { label: "travel", bit: 1 << 0 },
  { label: "health", bit: 1 << 1 },
  { label: "ecommerce", bit: 1 << 2 },
];

export function activeVerticalsList(bitmap: number): string[] {
  return VERTICAL_BITS.filter((v) => (bitmap & v.bit) !== 0).map((v) => v.label);
}

export function basisPointsToPercent(bps: number): string {
  return `${(bps / 100).toFixed(1)}%`;
}

export const MILESTONE_TYPE_LABEL: Record<number, string> = {
  0x01: "First confirmed payout",
  0x02: "10 payouts with consideration",
  0x03: "50 payouts with consideration",
  0x04: "100 payouts with consideration",
  0x10: "Tier upgrade",
  0x20: "Consideration rate >90% (30d)",
  0xff: "Negative anomaly flag",
};

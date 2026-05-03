export type ApiCampaignStatus = "draft" | "in_review" | "active" | "paused" | "archived";
export type ApiCampaignObjective = "acquisition" | "monetization";
export type ApiCampaignOnchainStatus = "not_started" | "funded_onchain";
export type ApiCampaignSettlementStatus = "pending" | "submitted" | "confirmed" | "failed";
export type ApiCampaignTransactionKind =
  | "funding"
  | "settlement"
  | "settlement_retry"
  | "withdrawal"
  | "adjustment";
export type ApiCampaignTransactionStatus = "pending" | "confirmed" | "failed";

export type ApiCampaignSettlement = {
  id: string;
  decisionId: string;
  status: ApiCampaignSettlementStatus;
  amountUsdc: number;
  txHash: string | null;
  errorMessage: string | null;
  confirmedAt: string | null;
  createdAt: string;
};

export type ApiCampaignTransaction = {
  id: string;
  kind: ApiCampaignTransactionKind;
  status: ApiCampaignTransactionStatus;
  signature: string;
  amountUsdc: number | null;
  decisionId: string | null;
  sourceAddress: string | null;
  destinationAddress: string | null;
  blockTime: string | null;
  errorMessage: string | null;
};

export type ApiCampaign = {
  id: string;
  userId: string;
  name: string;
  advertiserName: string;
  status: ApiCampaignStatus;
  objective: ApiCampaignObjective;
  destinationUrl: string;
  summary: string;
  geo: string;
  intentCategory: string;
  monthlyBudgetUsd: number;
  maxBidPerDecisionUsd: number;
  onchainStatus: ApiCampaignOnchainStatus;
  sponsorWallet: string | null;
  onchainTxHash: string | null;
  onchainProgramId: string | null;
  onchainCampaignPda: string | null;
  onchainVaultTokenAccount: string | null;
  onchainBudgetTotalAtomic: string | null;
  onchainBudgetAvailableAtomic: string | null;
  onchainBudgetSpentAtomic: string | null;
  onchainBudgetTotalUsdc: number | null;
  onchainBudgetAvailableUsdc: number | null;
  onchainBudgetSpentUsdc: number | null;
  fundedAt: string | null;
  audienceDescription: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  settlements: ApiCampaignSettlement[];
};

export type CampaignAnalyticsTopMetrics = {
  ctd: number;
  winRate: number;
  loserRate: number;
  costPerDecisionUsd: number;
};

export type CampaignAnalyticsSeriesPoint = {
  period: string;
  spend: number;
  winRate: number;
  cdr: number;
  loserRate: number;
  decisionCost: number;
};

export type CampaignAnalyticsResponse = {
  topMetrics: CampaignAnalyticsTopMetrics;
  series: CampaignAnalyticsSeriesPoint[];
};

export type CampaignSummaryResponse = {
  campaignCount: number;
  budgetUsd: number;
  spendUsd: number;
  impressions: number;
  clicks: number;
  conversions: number;
  avgWinRate: number;
  avgCostPerDecisionUsd: number;
};

export type CampaignRecord = {
  id: string;
  name: string;
  advertiser: string;
  status: string;
  statusCode: ApiCampaignStatus;
  objective: string;
  objectiveCode: ApiCampaignObjective;
  monthlyBudget: number;
  remainingBudget: number;
  maxBidPerDecision: number;
  spend: number;
  ctr: number;
  ctd: number;
  costPerDecision: number;
  recommendations: number;
  influencedDecisions: number;
  winRate: number;
  impressions: number;
  clicks: number;
  conversions: number;
  segment: string;
  audience: string;
  geo: string;
  destinationUrl: string;
  intentCategory: string;
  updatedAt: string;
  summary: string;
  sponsorWallet: string | null;
  onchainStatus: ApiCampaignOnchainStatus;
  onchainCampaignPda: string | null;
  onchainVaultTokenAccount: string | null;
  onchainProgramId: string | null;
  fundedAt: string | null;
  settlements: ApiCampaignSettlement[];
};

export type CampaignRecordLabels = {
  intentLabels: Record<string, string>;
  statusLabels: Record<ApiCampaignStatus, string>;
  objectiveLabels: Record<ApiCampaignObjective, string>;
  audiencePending: string;
};

export function mapApiCampaignToRecord(
  campaign: ApiCampaign,
  analytics?: CampaignAnalyticsResponse | null,
  labels?: CampaignRecordLabels,
): CampaignRecord {
  const series = analytics?.series ?? [];
  const topMetrics = analytics?.topMetrics;
  const spend = series.reduce((total, point) => total + point.spend, 0);
  const remainingBudget =
    campaign.onchainBudgetAvailableUsdc ?? Math.max(campaign.monthlyBudgetUsd - spend, 0);

  return {
    id: campaign.id,
    name: campaign.name,
    advertiser: campaign.advertiserName,
    status: labels?.statusLabels[campaign.status] ?? campaign.status,
    statusCode: campaign.status,
    objective: labels?.objectiveLabels[campaign.objective] ?? campaign.objective,
    objectiveCode: campaign.objective,
    monthlyBudget: campaign.monthlyBudgetUsd,
    remainingBudget,
    maxBidPerDecision: campaign.maxBidPerDecisionUsd,
    spend,
    ctr: 0,
    ctd: topMetrics?.ctd ?? 0,
    costPerDecision: topMetrics?.costPerDecisionUsd ?? 0,
    recommendations: 0,
    influencedDecisions: 0,
    winRate: topMetrics?.winRate ?? 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    segment: labels?.intentLabels[campaign.intentCategory] ?? campaign.intentCategory,
    audience: campaign.audienceDescription ?? labels?.audiencePending ?? "Audience description pending.",
    geo: campaign.geo,
    destinationUrl: campaign.destinationUrl,
    intentCategory: campaign.intentCategory,
    updatedAt: campaign.updatedAt,
    summary: campaign.summary,
    sponsorWallet: campaign.sponsorWallet,
    onchainStatus: campaign.onchainStatus,
    onchainCampaignPda: campaign.onchainCampaignPda,
    onchainVaultTokenAccount: campaign.onchainVaultTokenAccount,
    onchainProgramId: campaign.onchainProgramId,
    fundedAt: campaign.fundedAt,
    settlements: campaign.settlements ?? [],
  };
}

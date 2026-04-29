export type ApiCampaignStatus = "draft" | "in_review" | "active" | "paused" | "archived";
export type ApiCampaignObjective = "acquisition" | "monetization";
export type ApiCampaignOnchainStatus = "not_started" | "funded_onchain";

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
};

const INTENT_LABELS: Record<string, string> = {
  viagens: "Viagens",
  ecommerce: "E-commerce",
  saas: "SaaS",
  financas: "Finanças",
  educacao: "Educação",
};

const STATUS_LABELS: Record<ApiCampaignStatus, string> = {
  draft: "Rascunho",
  in_review: "Esperando pagamento",
  active: "Ativa",
  paused: "Pausada",
  archived: "Arquivada",
};

const OBJECTIVE_LABELS: Record<ApiCampaignObjective, string> = {
  acquisition: "Aquisição",
  monetization: "Monetização",
};

export function mapApiCampaignToRecord(
  campaign: ApiCampaign,
  analytics?: CampaignAnalyticsResponse | null,
): CampaignRecord {
  const series = analytics?.series ?? [];
  const topMetrics = analytics?.topMetrics;

  return {
    id: campaign.id,
    name: campaign.name,
    advertiser: campaign.advertiserName,
    status: STATUS_LABELS[campaign.status] ?? campaign.status,
    statusCode: campaign.status,
    objective: OBJECTIVE_LABELS[campaign.objective] ?? campaign.objective,
    objectiveCode: campaign.objective,
    monthlyBudget: campaign.monthlyBudgetUsd,
    maxBidPerDecision: campaign.maxBidPerDecisionUsd,
    spend: series.reduce((total, point) => total + point.spend, 0),
    ctr: 0,
    ctd: topMetrics?.ctd ?? 0,
    costPerDecision: topMetrics?.costPerDecisionUsd ?? 0,
    recommendations: 0,
    influencedDecisions: 0,
    winRate: topMetrics?.winRate ?? 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    segment: INTENT_LABELS[campaign.intentCategory] ?? campaign.intentCategory,
    audience: campaign.audienceDescription ?? "Audience description pending.",
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
  };
}

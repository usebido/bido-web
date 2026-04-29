export type CampaignRecord = {
  id: string;
  name: string;
  advertiser: string;
  status: "Ativa" | "Em revisão" | "Pausada";
  objective: "Aquisição" | "Monetização";
  monthlyBudget: number;
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
  prompts: string[];
  trend: number[];
  decisionCostTrend: { period: string; value: number }[];
  winRateTrend: { period: string; value: number }[];
};

export const campaigns: CampaignRecord[] = [
  {
    id: "avianca-concierge",
    name: "Delta Flights Brasil",
    advertiser: "Delta",
    status: "Ativa",
    objective: "Aquisição",
    monthlyBudget: 1000,
    spend: 423,
    ctr: 4.8,
    ctd: 14.2,
    costPerDecision: 0.38,
    recommendations: 8421,
    influencedDecisions: 1196,
    winRate: 31,
    impressions: 182400,
    clicks: 8755,
    conversions: 642,
    segment: "Viagens premium",
    audience: "Usuários perguntando por voos executivos, milhas e upgrades",
    geo: "Brasil, Chile, Colômbia",
    destinationUrl: "https://www.delta.com/br/pt",
    intentCategory: "viagens",
    updatedAt: "2026-04-28T10:30:00.000Z",
    summary: "Campanha focada em intenção de compra alta dentro de chats de viagem e concierge de IA.",
    prompts: [
      "melhor voo executivo de GRU para JFK",
      "como usar milhas para upgrade internacional",
      "companhia com lounge e tarifa flexível",
    ],
    trend: [16, 24, 21, 32, 38, 41, 49, 57, 64, 72, 76, 81],
    decisionCostTrend: [
      { period: "Seg", value: 0.42 },
      { period: "Ter", value: 0.39 },
      { period: "Qua", value: 0.41 },
      { period: "Qui", value: 0.37 },
      { period: "Sex", value: 0.36 },
      { period: "Sab", value: 0.38 },
      { period: "Dom", value: 0.38 },
    ],
    winRateTrend: [
      { period: "Seg", value: 24 },
      { period: "Ter", value: 27 },
      { period: "Qua", value: 29 },
      { period: "Qui", value: 33 },
      { period: "Sex", value: 32 },
      { period: "Sab", value: 31 },
      { period: "Dom", value: 31 },
    ],
  },
  {
    id: "nubank-assistant-plus",
    name: "Nubank Assistant Plus",
    advertiser: "Nubank",
    status: "Ativa",
    objective: "Monetização",
    monthlyBudget: 92000,
    spend: 61350,
    ctr: 3.4,
    ctd: 9.8,
    costPerDecision: 0.44,
    recommendations: 6230,
    influencedDecisions: 861,
    winRate: 24,
    impressions: 140200,
    clicks: 4767,
    conversions: 389,
    segment: "Finanças pessoais",
    audience: "Plataformas de IA com perguntas sobre cartão, crédito e rendimento",
    geo: "Brasil",
    destinationUrl: "https://nubank.com.br",
    intentCategory: "financas",
    updatedAt: "2026-04-27T18:15:00.000Z",
    summary: "Monetização de inventário conversacional para consultas financeiras de alta intenção.",
    prompts: [
      "melhor cartão sem anuidade para cashback",
      "vale mais a pena CDI ou Tesouro Selic",
      "como renegociar dívida do cartão",
    ],
    trend: [12, 14, 19, 23, 26, 28, 34, 39, 44, 48, 53, 59],
    decisionCostTrend: [
      { period: "Seg", value: 0.5 },
      { period: "Ter", value: 0.46 },
      { period: "Qua", value: 0.44 },
      { period: "Qui", value: 0.43 },
      { period: "Sex", value: 0.45 },
      { period: "Sab", value: 0.44 },
      { period: "Dom", value: 0.44 },
    ],
    winRateTrend: [
      { period: "Seg", value: 18 },
      { period: "Ter", value: 20 },
      { period: "Qua", value: 22 },
      { period: "Qui", value: 25 },
      { period: "Sex", value: 24 },
      { period: "Sab", value: 24 },
      { period: "Dom", value: 24 },
    ],
  },
  {
    id: "shopify-agent-promo",
    name: "Shopify Agent Promo",
    advertiser: "Shopify",
    status: "Em revisão",
    objective: "Aquisição",
    monthlyBudget: 138000,
    spend: 28810,
    ctr: 5.1,
    ctd: 11.6,
    costPerDecision: 0.41,
    recommendations: 4140,
    influencedDecisions: 702,
    winRate: 28,
    impressions: 51200,
    clicks: 2611,
    conversions: 211,
    segment: "E-commerce",
    audience: "Lojistas avaliando plataforma, checkout e recuperação de carrinho",
    geo: "América Latina",
    destinationUrl: "https://www.shopify.com/br",
    intentCategory: "ecommerce",
    updatedAt: "2026-04-28T08:00:00.000Z",
    summary: "Criativos novos em aprovação para jornadas de migração de loja e expansão internacional.",
    prompts: [
      "plataforma melhor para vender fora do Brasil",
      "como aumentar conversão no checkout",
      "setup rápido para loja DTC",
    ],
    trend: [8, 12, 11, 16, 21, 27, 33, 37, 35, 31, 28, 24],
    decisionCostTrend: [
      { period: "Seg", value: 0.48 },
      { period: "Ter", value: 0.45 },
      { period: "Qua", value: 0.41 },
      { period: "Qui", value: 0.39 },
      { period: "Sex", value: 0.42 },
      { period: "Sab", value: 0.41 },
      { period: "Dom", value: 0.41 },
    ],
    winRateTrend: [
      { period: "Seg", value: 20 },
      { period: "Ter", value: 23 },
      { period: "Qua", value: 26 },
      { period: "Qui", value: 29 },
      { period: "Sex", value: 28 },
      { period: "Sab", value: 28 },
      { period: "Dom", value: 28 },
    ],
  },
  {
    id: "anthropic-api-marketplace",
    name: "Anthropic API Marketplace",
    advertiser: "Anthropic",
    status: "Pausada",
    objective: "Monetização",
    monthlyBudget: 74000,
    spend: 74000,
    ctr: 2.7,
    ctd: 7.9,
    costPerDecision: 0.63,
    recommendations: 7310,
    influencedDecisions: 512,
    winRate: 19,
    impressions: 204500,
    clicks: 5521,
    conversions: 301,
    segment: "Infra de IA",
    audience: "Builders comparando APIs, latency e custos de modelos",
    geo: "EUA, Europa",
    destinationUrl: "https://www.anthropic.com/api",
    intentCategory: "saas",
    updatedAt: "2026-04-25T12:45:00.000Z",
    summary: "Budget encerrado no ciclo atual; rota pausada para recalibrar bids por categoria de prompt.",
    prompts: [
      "qual API de LLM tem melhor custo",
      "como reduzir latência em agente multimodal",
      "comparação entre APIs para tool calling",
    ],
    trend: [28, 30, 34, 33, 29, 27, 26, 24, 21, 18, 16, 14],
    decisionCostTrend: [
      { period: "Seg", value: 0.74 },
      { period: "Ter", value: 0.68 },
      { period: "Qua", value: 0.64 },
      { period: "Qui", value: 0.62 },
      { period: "Sex", value: 0.63 },
      { period: "Sab", value: 0.63 },
      { period: "Dom", value: 0.63 },
    ],
    winRateTrend: [
      { period: "Seg", value: 13 },
      { period: "Ter", value: 15 },
      { period: "Qua", value: 18 },
      { period: "Qui", value: 20 },
      { period: "Sex", value: 19 },
      { period: "Sab", value: 19 },
      { period: "Dom", value: 19 },
    ],
  },
];

export function getCampaignById(id: string) {
  return campaigns.find((campaign) => campaign.id === id) ?? null;
}

export function getCampaignSummary() {
  return campaigns.reduce(
    (acc, campaign) => {
      acc.budget += campaign.monthlyBudget;
      acc.spend += campaign.spend;
      acc.impressions += campaign.impressions;
      acc.clicks += campaign.clicks;
      acc.conversions += campaign.conversions;
      return acc;
    },
    { budget: 0, spend: 0, impressions: 0, clicks: 0, conversions: 0 },
  );
}

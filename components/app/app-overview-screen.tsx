"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { MiniStatChart } from "@/components/dashboard/mini-stat-chart";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCampaigns, useCampaignSummary } from "@/lib/campaign-store";

export function AppOverviewScreen() {
  const { formatCurrency } = useI18n();
  const { campaigns, loading, error } = useCampaigns();
  const { summary, loading: summaryLoading, error: summaryError } = useCampaignSummary();
  const costPerDecision = campaigns.length
    ? campaigns.reduce((sum, campaign) => sum + campaign.maxBidPerDecision, 0) / campaigns.length
    : 0;
  const auctionWinRate = summary?.avgWinRate ?? 0;
  const costPerDecisionItems = campaigns.map((campaign) => ({
    label: campaign.name.replace(" Brasil", "").split(" ").slice(0, 2).join(" "),
    value: campaign.maxBidPerDecision,
  }));
  const winRateItems = campaigns.map((campaign) => ({
    label: campaign.name.replace(" Brasil", "").split(" ").slice(0, 2).join(" "),
    value: campaign.winRate,
  }));

  return (
    <>
      <DashboardHeader />

      {error || summaryError ? (
        <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error ?? summaryError}
        </div>
      ) : null}

      {loading && summaryLoading ? (
        <div className="mb-5 rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
          Carregando dashboard...
        </div>
      ) : null}

      <div className="mb-5">
        <MetricChart campaigns={campaigns} />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <MiniStatChart
          label="Custo por Decisão"
          value={formatCurrency(costPerDecision)}
          color="#6366f1"
          items={costPerDecisionItems}
          formatter={(current) => formatCurrency(current)}
        />
        <MiniStatChart
          label="Win Rate no Leilão"
          value={`${auctionWinRate.toFixed(1)}%`}
          color="#10b981"
          items={winRateItems}
          formatter={(current) => `${current.toFixed(1)}%`}
        />
      </div>
    </>
  );
}

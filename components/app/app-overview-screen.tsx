"use client";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MetricChart } from "@/components/dashboard/metric-chart";
import { MiniStatChart } from "@/components/dashboard/mini-stat-chart";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCampaigns } from "@/lib/campaign-store";

export function AppOverviewScreen() {
  const { formatCurrency } = useI18n();
  const campaigns = useCampaigns();
  const summary = campaigns.reduce(
    (acc, campaign) => {
      acc.budget += campaign.monthlyBudget;
      acc.spend += campaign.spend;
      acc.impressions += campaign.impressions;
      acc.clicks += campaign.clicks;
      acc.conversions += campaign.conversions;
      acc.winRate += campaign.winRate;
      return acc;
    },
    { budget: 0, spend: 0, impressions: 0, clicks: 0, conversions: 0, winRate: 0 },
  );
  const costPerDecision = summary.conversions > 0 ? summary.spend / summary.conversions : 0;
  const auctionWinRate = campaigns.length ? summary.winRate / campaigns.length : 0;
  const costPerDecisionItems = campaigns.map((campaign) => ({
    label: campaign.name.replace(" Brasil", "").split(" ").slice(0, 2).join(" "),
    value: campaign.costPerDecision,
  }));
  const winRateItems = campaigns.map((campaign) => ({
    label: campaign.name.replace(" Brasil", "").split(" ").slice(0, 2).join(" "),
    value: campaign.winRate,
  }));

  return (
    <>
      <DashboardHeader />

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

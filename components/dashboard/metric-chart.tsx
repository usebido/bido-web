"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { CampaignRecord } from "@/lib/app-campaign-data";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/area-charts-2";
import { useI18n } from "@/components/providers/i18n-provider";

function shortName(name: string) {
  return name.replace(" Brasil", "").split(" ").slice(0, 2).join(" ");
}

export function MetricChart({ campaigns }: { campaigns: CampaignRecord[] }) {
  const { formatCurrency } = useI18n();
  const [activeTab, setActiveTab] = useState<"ctd" | "spend">("ctd");

  const averageCtd = campaigns.length
    ? campaigns.reduce((sum, campaign) => sum + campaign.ctd, 0) / campaigns.length
    : 0;
  const totalSpend = campaigns.reduce((sum, campaign) => sum + campaign.spend, 0);

  const ctdData = useMemo(
    () =>
      campaigns.map((campaign) => ({
        name: shortName(campaign.name),
        fullName: campaign.name,
        value: campaign.ctd,
      })),
    [campaigns],
  );

  const spendData = useMemo(
    () =>
      campaigns.map((campaign) => ({
        name: shortName(campaign.name),
        fullName: campaign.name,
        spend: campaign.spend,
        remaining: Math.max(campaign.monthlyBudget - campaign.spend, 0),
      })),
    [campaigns],
  );

  const tabs = [
    { key: "ctd" as const, label: "CTD", value: `${averageCtd.toFixed(1)}%`, color: "#6366f1" },
    {
      key: "spend" as const,
      label: "Spend",
      value: formatCurrency(totalSpend, { currency: "USD" }),
      color: "#10b981",
    },
  ];

  const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const ctdChartConfig: ChartConfig = {
    value: {
      label: "CTD",
      color: "#6366f1",
    },
  };
  const spendChartConfig: ChartConfig = {
    spend: {
      label: "Gasto",
      color: "#10b981",
    },
    remaining: {
      label: "Disponível",
      color: "#dfe6dc",
    },
  };
  const chartConfig: ChartConfig = activeTab === "ctd" ? ctdChartConfig : spendChartConfig;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative flex flex-col gap-0.5 px-6 py-4 text-left transition-colors hover:bg-muted/40 ${
              activeTab === tab.key ? "bg-muted/30" : ""
            }`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {tab.label}
            </span>
            <span className="text-2xl font-bold tabular-nums text-foreground">{tab.value}</span>
            {activeTab === tab.key ? (
              <span
                className="absolute right-0 bottom-0 left-0 h-0.5 rounded-t-full"
                style={{ backgroundColor: active.color }}
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="px-4 py-6">
        <ChartContainer config={chartConfig} className="h-72 w-full">
          {activeTab === "ctd" ? (
            <BarChart data={ctdData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.45} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis tickLine={false} axisLine={false} width={44} tickFormatter={(value) => `${value}%`} />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName}
                    formatter={(value) => (
                      <span className="text-foreground font-mono font-medium tabular-nums">
                        {Number(value).toFixed(1)}%
                      </span>
                    )}
                  />
                }
              />
              <Bar dataKey="value" fill="var(--color-value)" radius={[8, 8, 0, 0]} maxBarSize={56} />
            </BarChart>
          ) : (
            <BarChart data={spendData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeOpacity={0.45} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={52}
                tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`}
              />
              <ChartTooltip
                cursor={{ fill: "var(--muted)", opacity: 0.2 }}
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName}
                    formatter={(value, name) => (
                      <div className="flex w-full items-center justify-between gap-3">
                        <span className="text-muted-foreground">{name}</span>
                        <span className="text-foreground font-mono font-medium tabular-nums">
                          {formatCurrency(Number(value), { currency: "USD", maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    )}
                  />
                }
              />
              <Bar dataKey="spend" stackId="budget" fill="var(--color-spend)" radius={[8, 8, 0, 0]} maxBarSize={56} />
              <Bar dataKey="remaining" stackId="budget" fill="var(--color-remaining)" radius={[8, 8, 0, 0]} maxBarSize={56} />
            </BarChart>
          )}
        </ChartContainer>
      </div>
    </div>
  );
}

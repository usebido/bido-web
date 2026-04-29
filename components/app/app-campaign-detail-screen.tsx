"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Pencil, Pause, Trash2, TrendingDown, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import type { CampaignRecord } from "@/lib/app-campaign-data";
import {
  ChartContainer,
  type ChartConfig,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/area-charts-2";
import { Card, CardContent, CardHeader, CardTitle, CardToolbar } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCampaign, useCampaignActions } from "@/lib/campaign-store";

function KpiCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}

type PeriodKey = "7d" | "30d" | "90d";

function buildPerformanceData(campaign: CampaignRecord, period: PeriodKey) {
  const pointCount = period === "7d" ? 7 : period === "30d" ? 6 : 6;
  const labels =
    period === "7d"
      ? ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"]
      : period === "30d"
        ? ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"]
        : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];

  const baseTrend = campaign.trend.slice(-pointCount);

  return labels.map((label, index) => {
    const curve = baseTrend[index] ?? baseTrend.at(-1) ?? 0;
    const decisionRate = campaign.decisionCostTrend[index]?.value ?? campaign.costPerDecision;
    const winRate = campaign.winRateTrend[index]?.value ?? campaign.winRate;
    const computedWinRate = Math.round(campaign.winRate * (0.72 + winRate / 100) + index * 2);
    const cdr = Math.max(0, campaign.ctd * (0.82 + curve / 120));
    const loserRate = Math.max(0, 100 - computedWinRate);

    return {
      period: label,
      spend: Math.round(campaign.spend * (0.65 + curve / 140)),
      winRate: computedWinRate,
      cdr,
      loserRate,
      decisionCost: Number((campaign.costPerDecision * (0.88 + decisionRate)).toFixed(2)),
    };
  });
}

export function AppCampaignDetailScreen({ campaign }: { campaign: CampaignRecord }) {
  const router = useRouter();
  const { formatCurrency } = useI18n();
  const currentCampaign = useCampaign(campaign.id, campaign);
  const { pauseCampaign, removeCampaign } = useCampaignActions();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("30d");
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const chartConfig = {
    cdr: {
      label: "CDR",
      color: "#4f5cff",
    },
    loserRate: {
      label: "Loser Rate",
      color: "#f59e0b",
    },
    winRate: {
      label: "Win Rate",
      color: "#10b981",
    },
  } satisfies ChartConfig;
  const chartData = useMemo(
    () => buildPerformanceData(currentCampaign, selectedPeriod),
    [currentCampaign, selectedPeriod],
  );
  const topMetrics = [
    {
      key: "recommendations",
      label: "CDR (Decision Rate)",
      value: `${currentCampaign.ctd.toFixed(1)}%`,
      change: 0,
    },
    {
      key: "decisions",
      label: "Loser Rate",
      value: `${Math.max(0, 100 - currentCampaign.winRate).toFixed(0)}%`,
      change: 3,
    },
    {
      key: "winRate",
      label: "Win Rate",
      value: `${currentCampaign.winRate}%`,
      change: 8,
    },
  ] as const;

  function handlePauseConfirm() {
    pauseCampaign(currentCampaign.id);
    setPauseConfirmOpen(false);
  }

  function handleDeleteConfirm() {
    removeCampaign(currentCampaign.id);
    setDeleteConfirmOpen(false);
    router.push("/app/campaigns");
  }

  return (
    <>
      <ConfirmDialog
        open={pauseConfirmOpen}
        title={currentCampaign.status === "Pausada" ? "Retomar campanha?" : "Pausar campanha?"}
        description={
          currentCampaign.status === "Pausada"
            ? "A campanha voltará a disputar leilões e aparecer em respostas de IA."
            : "A campanha deixará de disputar leilões até você ativá-la novamente."
        }
        confirmLabel={currentCampaign.status === "Pausada" ? "Retomar" : "Pausar"}
        onCancel={() => setPauseConfirmOpen(false)}
        onConfirm={handlePauseConfirm}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remover campanha?"
        description="Essa ação remove a campanha da sua lista local e não pode ser desfeita."
        confirmLabel="Remover"
        confirmVariant="destructive"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{currentCampaign.name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{currentCampaign.summary}</p>
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/app/campaigns"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Todas as campanhas
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="lg">
              Actions
              <ChevronDown className="-me-1 ms-1.5 opacity-60" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/app/campaigns/${currentCampaign.id}/edit`}>
                <Pencil className="size-4 opacity-60" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => setPauseConfirmOpen(true)}>
              <Pause className="size-4 opacity-60" />
              {currentCampaign.status === "Pausada" ? "Retomar" : "Pausar"}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onSelect={() => setDeleteConfirmOpen(true)}
            >
              <Trash2 className="size-4 opacity-60" />
              Remover
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Campanha" value={currentCampaign.name} />
          <KpiCard label="Status" value={currentCampaign.status} />
          <KpiCard label="Budget" value={formatCurrency(currentCampaign.monthlyBudget, { currency: "USD" })} />
          <KpiCard
            label="Custo por Decisão"
            value={formatCurrency(currentCampaign.costPerDecision, { currency: "USD" })}
          />
        </div>
      </section>

      <section className="mt-5">
        <Card>
          <CardHeader className="min-h-auto border-0 py-6">
            <CardTitle className="text-lg font-semibold">Campaign Performance</CardTitle>
            <CardToolbar>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </CardToolbar>
          </CardHeader>
          <CardContent className="px-2.5">
            <div className="px-2.5">
              <div className="mb-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {topMetrics.map((metric) => (
                  <div key={metric.key} className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className="h-12 w-0.5 rounded-full bg-border" />
                      <div className="flex flex-col gap-2">
                        <div className="text-sm font-medium text-muted-foreground">{metric.label}</div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl font-semibold leading-none">{metric.value}</span>
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-medium ${
                              metric.change >= 0 ? "text-green-500" : "text-destructive"
                            }`}
                          >
                            {metric.change >= 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                            {Math.abs(metric.change)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <ChartContainer
              config={chartConfig}
              className="h-[420px] w-full [&_.recharts-curve.recharts-tooltip-cursor]:stroke-initial"
            >
              <AreaChart
                accessibilityLayer
                data={chartData}
                margin={{
                  top: 10,
                  bottom: 10,
                  left: 20,
                  right: 20,
                }}
              >
                <defs>
                  <linearGradient id="fillCdr" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-cdr)" stopOpacity={0.16} />
                    <stop offset="95%" stopColor="var(--color-cdr)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillLoserRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-loserRate)" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="var(--color-loserRate)" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="fillWinRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-winRate)" stopOpacity={0.14} />
                    <stop offset="95%" stopColor="var(--color-winRate)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="period"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tick={{ textAnchor: "middle", fontSize: 12 }}
                  interval={0}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={{
                    strokeDasharray: "4 4",
                    stroke: "oklch(45.7% 0.24 277.023)",
                    strokeWidth: 1,
                    strokeOpacity: 0.6,
                  }}
                  content={<ChartTooltipContent hideLabel indicator="dot" />}
                  offset={20}
                  position={{ x: undefined, y: undefined }}
                />
                <Area
                  dataKey="cdr"
                  type="natural"
                  fill="url(#fillCdr)"
                  stroke="var(--color-cdr)"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-cdr)", stroke: "white", strokeWidth: 1.5 }}
                />
                <Area
                  dataKey="loserRate"
                  type="natural"
                  fill="url(#fillLoserRate)"
                  stroke="var(--color-loserRate)"
                  strokeWidth={2.1}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-loserRate)", stroke: "white", strokeWidth: 1.5 }}
                />
                <Area
                  dataKey="winRate"
                  type="natural"
                  fill="url(#fillWinRate)"
                  stroke="var(--color-winRate)"
                  strokeWidth={2.2}
                  dot={false}
                  activeDot={{ r: 4, fill: "var(--color-winRate)", stroke: "white", strokeWidth: 1.5 }}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </section>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ExternalLink, Pencil, Pause, Rocket, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useWallets } from "@privy-io/react-auth/solana";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
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
import { ShimmerBlock } from "@/components/ui/animated-loading-skeleton";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { useI18n } from "@/components/providers/i18n-provider";
import { useCampaign, useCampaignActions, useCampaignAnalytics, useCampaignTransactions } from "@/lib/hooks/use-campaigns";

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

const DEFAULT_SOLANA_RPC_URL = "https://api.devnet.solana.com";
const DEFAULT_DEVNET_USDC_MINT = "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU";

function decodeBase64ToBytes(value: string) {
  const decoded = window.atob(value);
  return Uint8Array.from(decoded, (char) => char.charCodeAt(0));
}

function encodeBytesToBase64(value: Uint8Array) {
  let binary = "";
  value.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

function compactAddress(value: string | null, fallback: string) {
  if (!value) {
    return fallback;
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function explorerUrl(address: string) {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

function explorerTxUrl(signature: string) {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

export function AppCampaignDetailScreen({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { formatCurrency, formatDate, formatNumber, messages, replace } = useI18n();
  const t = messages.app.campaignDetail;
  const balanceFetchFailedLabel = t.onchain.balanceFetchFailed;
  const { ready: walletsReady, wallets } = useWallets();
  const { campaign, loading, error } = useCampaign(campaignId);
  const {
    pauseCampaign,
    removeCampaign,
    prepareCampaignInitialization,
    confirmCampaignInitialization,
    prepareCampaignFunding,
    relayCampaignFunding,
    confirmCampaignFunding,
    solanaChain,
  } = useCampaignActions();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("30d");
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingPending, setFundingPending] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useCampaignAnalytics(campaignId, selectedPeriod);
  const {
    transactions,
    loading: transactionsLoading,
  } = useCampaignTransactions(campaignId, 100);
  const activeWallet = wallets[0] ?? null;
  const chartConfig = {
    cdr: {
      label: t.performance.chartLegend.ctd,
      color: "#4f5cff",
    },
    loserRate: {
      label: t.performance.chartLegend.loserRate,
      color: "#f59e0b",
    },
    winRate: {
      label: t.performance.chartLegend.winRate,
      color: "#10b981",
    },
  } satisfies ChartConfig;
  const chartData = analytics?.series ?? [];
  const currentCampaign = campaign;
  const topMetrics = [
    {
      key: "ctd",
      label: t.performance.topMetrics.ctd,
      value: formatNumber(analytics?.topMetrics.ctd ?? 0, {
        maximumFractionDigits: 0,
      }),
      change: 0,
    },
    {
      key: "loserRate",
      label: t.performance.topMetrics.loserRate,
      value: `${analytics?.topMetrics.loserRate.toFixed(1) ?? "0.0"}%`,
      change: 0,
    },
    {
      key: "winRate",
      label: t.performance.topMetrics.winRate,
      value: `${analytics?.topMetrics.winRate.toFixed(1) ?? "0.0"}%`,
      change: 0,
    },
  ] as const;

  useEffect(() => {
    if (!walletsReady || !activeWallet?.address) {
      return;
    }

    let cancelled = false;

    async function loadBalances() {
      setBalanceLoading(true);
      setBalanceError(null);

      try {
        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
        const usdcMintAddress = process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? DEFAULT_DEVNET_USDC_MINT;
        const connection = new Connection(rpcUrl, "confirmed");
        const owner = new PublicKey(activeWallet.address);
        const mint = new PublicKey(usdcMintAddress);
        const ata = getAssociatedTokenAddressSync(mint, owner, false);

        const tokenBalance = await connection.getTokenAccountBalance(ata, "confirmed").catch(() => null);

        if (cancelled) {
          return;
        }

        setUsdcBalance(tokenBalance ? Number(tokenBalance.value.uiAmountString ?? "0") : 0);
      } catch (currentError) {
        if (cancelled) {
          return;
        }

        setBalanceError(currentError instanceof Error ? currentError.message : balanceFetchFailedLabel);
      } finally {
        if (!cancelled) {
          setBalanceLoading(false);
        }
      }
    }

    void loadBalances();

    return () => {
      cancelled = true;
    };
  }, [activeWallet?.address, balanceFetchFailedLabel, walletsReady]);

  const requiredUsdc = currentCampaign?.monthlyBudget ?? 0;
  const effectiveUsdcBalance = activeWallet ? usdcBalance : null;
  const hasEnoughUsdc = effectiveUsdcBalance !== null && effectiveUsdcBalance >= requiredUsdc;
  const activationDisabledReason = !walletsReady
    ? t.onchain.loadingWallet
    : !activeWallet
      ? t.onchain.loginNeeded
      : balanceLoading
        ? t.onchain.checkingBalance
        : balanceError
          ? t.onchain.balanceCheckFailed
          : !hasEnoughUsdc
            ? replace(t.onchain.notEnoughUsdc, {
                amount: formatCurrency(requiredUsdc, {
                  currency: "USD",
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                }),
              })
            : null;
  const onchainLinks = [
    {
      label: t.onchain.addressLabels.campaignPda,
      value: currentCampaign?.onchainCampaignPda ?? null,
    },
    {
      label: t.onchain.addressLabels.vault,
      value: currentCampaign?.onchainVaultTokenAccount ?? null,
    },
    {
      label: t.onchain.addressLabels.programId,
      value: currentCampaign?.onchainProgramId ?? null,
    },
  ].filter((item) => item.value);
  const transactionStatusTone: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20",
    confirmed: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20",
    failed: "bg-destructive/10 text-destructive ring-1 ring-destructive/20",
  };
  const transactionKindTone: Record<string, string> = {
    funding: "bg-sky-500/10 text-sky-700 ring-1 ring-sky-500/20",
    settlement: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20",
    settlement_retry: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20",
    withdrawal: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20",
    adjustment: "bg-surface text-foreground ring-1 ring-border",
  };

  async function handlePauseConfirm() {
    if (!currentCampaign) {
      return;
    }

    await pauseCampaign(currentCampaign.id, currentCampaign.statusCode);
    setPauseConfirmOpen(false);
  }

  async function handleDeleteConfirm() {
    if (!currentCampaign) {
      return;
    }

    await removeCampaign(currentCampaign.id);
    setDeleteConfirmOpen(false);
    router.push("/app/campaigns");
  }

  async function handleActivateCampaign() {
    if (!currentCampaign) {
      return;
    }

    setFundingPending(true);
    setFundingError(null);

    try {
      let txHash: string;
      const runPreparedTransaction = async (prepared:
        | Awaited<ReturnType<typeof prepareCampaignInitialization>>
        | Awaited<ReturnType<typeof prepareCampaignFunding>>,
      ) => {
        const sponsorWallet = wallets.find((wallet) => wallet.address === prepared.sponsorWallet);

        if (!sponsorWallet) {
          throw new Error(t.onchain.sponsorMismatch);
        }

        if (prepared.submissionMode === "kora" && prepared.koraSignerAddress) {
          const signed = await sponsorWallet.signTransaction({
            transaction: decodeBase64ToBytes(prepared.txBase64),
            chain: solanaChain,
          });

          const relayed = await relayCampaignFunding(
            currentCampaign.id,
            encodeBytesToBase64(signed.signedTransaction),
            prepared.koraSignerAddress,
          );
          return relayed.txHash;
        }

        const result = await sponsorWallet.signAndSendTransaction({
          transaction: decodeBase64ToBytes(prepared.txBase64),
          chain: solanaChain,
        });
        return bs58.encode(result.signature);
      };

      const needsInitialization =
        !currentCampaign.onchainCampaignPda || !currentCampaign.onchainVaultTokenAccount;

      if (needsInitialization) {
        const initialization = await prepareCampaignInitialization(currentCampaign.id);
        txHash = await runPreparedTransaction(initialization);
        await confirmCampaignInitialization(currentCampaign.id, txHash);
      }

      const prepared = await prepareCampaignFunding(currentCampaign.id);
      txHash = await runPreparedTransaction(prepared);
      await confirmCampaignFunding(currentCampaign.id, txHash);
    } catch (currentError) {
      setFundingError(currentError instanceof Error ? currentError.message : t.onchain.activationFailed);
    } finally {
      setFundingPending(false);
    }
  }

  if (loading) {
    return <CampaignDetailSkeleton />;
  }

  if (!currentCampaign) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        {error ?? t.campaignNotFound}
      </div>
    );
  }

  return (
    <>
      <ConfirmDialog
        open={pauseConfirmOpen}
        title={currentCampaign.statusCode === "paused" ? t.pauseDialog.resumeTitle : t.pauseDialog.pauseTitle}
        description={
          currentCampaign.statusCode === "paused"
            ? t.pauseDialog.resumeDescription
            : t.pauseDialog.pauseDescription
        }
        confirmLabel={currentCampaign.statusCode === "paused" ? t.menu.resume : t.menu.pause}
        onCancel={() => setPauseConfirmOpen(false)}
        onConfirm={handlePauseConfirm}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title={t.deleteDialog.title}
        description={t.deleteDialog.description}
        confirmLabel={t.deleteDialog.confirm}
        confirmVariant="destructive"
        onCancel={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteConfirm}
      />

      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{currentCampaign.name}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">{currentCampaign.summary}</p>
      </header>

      {analyticsError ? (
        <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {analyticsError}
        </div>
      ) : null}
      {fundingError ? (
        <div className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {fundingError}
        </div>
      ) : null}
      {balanceError ? (
        <div className="mb-5 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
          {balanceError}
        </div>
      ) : null}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/app/campaigns"
          className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {t.backToCampaigns}
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {onchainLinks.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  {t.onChainMenu}
                  <ChevronDown className="-me-1 ms-1.5 opacity-60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {onchainLinks.map((item) => (
                  <DropdownMenuItem key={item.label} asChild>
                    <a
                      href={explorerUrl(item.value!)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="flex flex-col">
                        <span>{item.label}</span>
                        <span className="text-xs text-muted-foreground">{compactAddress(item.value, t.onchain.notCreated)}</span>
                      </span>
                      <ExternalLink className="size-4 opacity-60" />
                    </a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg">
                {t.actionsMenu}
                <ChevronDown className="-me-1 ms-1.5 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/app/campaigns/${currentCampaign.id}/edit`}>
                  <Pencil className="size-4 opacity-60" />
                  {t.menu.edit}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setPauseConfirmOpen(true)}>
                <Pause className="size-4 opacity-60" />
                {currentCampaign.statusCode === "paused" ? t.menu.resume : t.menu.pause}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onSelect={() => setDeleteConfirmOpen(true)}
              >
                <Trash2 className="size-4 opacity-60" />
                {t.menu.remove}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label={t.kpis.campaign} value={currentCampaign.name} />
          <KpiCard label={t.kpis.status} value={currentCampaign.status} />
          <KpiCard
            label={t.kpis.budget}
            value={formatCurrency(currentCampaign.remainingBudget, { currency: "USD" })}
          />
          <KpiCard
            label={t.kpis.maxBid}
            value={formatCurrency(currentCampaign.maxBidPerDecision, {
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          />
        </div>
      </section>

      {currentCampaign.onchainStatus !== "funded_onchain" ? (
        <section className="mt-5 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t.onchain.sectionLabel}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{t.onchain.pending}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {replace(t.onchain.pendingDescription, {
                  amount: formatCurrency(currentCampaign.monthlyBudget, {
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }),
                })}
              </p>
            </div>

            <div className="flex flex-col items-stretch gap-2">
              <button
                type="button"
                onClick={handleActivateCampaign}
                disabled={fundingPending || activationDisabledReason !== null}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet px-5 py-3 text-sm font-semibold text-violet-foreground transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fundingPending ? <Wallet className="size-4 animate-pulse" /> : <Rocket className="size-4" />}
                {fundingPending ? t.onchain.signing : t.onchain.activate}
              </button>
              {activationDisabledReason ? (
                <p className="max-w-sm text-sm text-amber-700">{activationDisabledReason}</p>
              ) : null}
            </div>
          </div>

        {!balanceLoading && activeWallet && !hasEnoughUsdc ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
            {replace(t.onchain.insufficientHelp, {
              current: formatCurrency(effectiveUsdcBalance ?? 0, {
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              required: formatCurrency(requiredUsdc, {
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
            })}
          </div>
        ) : null}
        {!balanceLoading && activeWallet ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            {t.onchain.gasSponsoredHelp}
          </div>
        ) : null}

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <KpiCard
              label={messages.app.dashboard.costPerDecision}
              value={formatCurrency(currentCampaign.maxBidPerDecision, {
                currency: "USD",
                minimumFractionDigits: 2,
                maximumFractionDigits: 4,
              })}
            />
            <KpiCard
              label={t.onchain.usdcBalance}
              value={
                balanceLoading
                  ? t.onchain.loading
                  : formatCurrency(effectiveUsdcBalance ?? 0, {
                      currency: "USD",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 4,
                    })
              }
            />
            <KpiCard
              label={t.onchain.sponsorWallet}
              value={
                activeWallet?.address
                  ? compactAddress(activeWallet.address, t.onchain.notCreated)
                  : currentCampaign.sponsorWallet
                    ? compactAddress(currentCampaign.sponsorWallet, t.onchain.notCreated)
                    : t.onchain.privyWalletFallback
              }
            />
          </div>
        </section>
      ) : null}

      <section className="mt-5">
        <Card>
          <CardHeader className="min-h-auto border-0 py-6">
            <CardTitle className="text-lg font-semibold">{t.performance.title}</CardTitle>
            <CardToolbar>
              <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodKey)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="7d">{t.performance.period7d}</SelectItem>
                  <SelectItem value="30d">{t.performance.period30d}</SelectItem>
                  <SelectItem value="90d">{t.performance.period90d}</SelectItem>
                </SelectContent>
              </Select>
            </CardToolbar>
          </CardHeader>
          <CardContent className="px-2.5">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-10">
                <OrbitalLoader message={t.loadingAnalytics} />
              </div>
            ) : null}
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

      <section className="mt-5">
        <Card>
          <CardHeader className="min-h-auto border-0 py-6">
            <div>
              <CardTitle className="text-lg font-semibold">{t.transactions.title}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{t.transactions.subtitle}</p>
            </div>
          </CardHeader>
          <CardContent>
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-10">
                <OrbitalLoader message={t.loadingTransactions} />
              </div>
            ) : transactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-background px-5 py-8 text-sm text-muted-foreground">
                {t.transactions.empty}
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-border">
                <div className="hidden grid-cols-[140px_140px_140px_1.2fr_1fr_180px] gap-4 border-b border-border bg-surface/70 px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground md:grid">
                  <span>{t.transactions.columns.type}</span>
                  <span>{t.transactions.columns.status}</span>
                  <span>{t.transactions.columns.amount}</span>
                  <span>{t.transactions.columns.tx}</span>
                  <span>{t.transactions.columns.decision}</span>
                  <span>{t.transactions.columns.createdAt}</span>
                </div>

                <div className="divide-y divide-border">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid gap-3 px-4 py-4 md:grid-cols-[140px_140px_140px_1.2fr_1fr_180px] md:items-center"
                    >
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.type}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${transactionKindTone[transaction.kind] ?? "bg-surface text-foreground ring-1 ring-border"}`}
                        >
                          {t.transactions.kinds[transaction.kind]}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.status}
                        </span>
                        <span
                          className={`inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold ${transactionStatusTone[transaction.status] ?? "bg-surface text-foreground ring-1 ring-border"}`}
                        >
                          {t.transactions.statuses[transaction.status]}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.amount}
                        </span>
                        <span className="text-sm font-semibold text-foreground">
                          {transaction.amountUsdc !== null
                            ? formatCurrency(transaction.amountUsdc, {
                                currency: "USD",
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4,
                              })
                            : t.transactions.amountUnavailable}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.tx}
                        </span>
                        {transaction.signature ? (
                          <a
                            href={explorerTxUrl(transaction.signature)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <span className="font-mono">{compactAddress(transaction.signature, t.transactions.txPending)}</span>
                            <ExternalLink className="size-4 opacity-60" aria-hidden="true" />
                          </a>
                        ) : (
                          <span className="text-sm text-muted-foreground">{t.transactions.txPending}</span>
                        )}
                        {transaction.errorMessage ? (
                          <span className="text-xs text-destructive">
                            {t.transactions.errorLabel}: {transaction.errorMessage}
                          </span>
                        ) : null}
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.decision}
                        </span>
                        <span className="font-mono text-sm text-foreground">
                          {transaction.decisionId
                            ? compactAddress(transaction.decisionId, transaction.decisionId)
                            : t.transactions.decisionUnavailable}
                        </span>
                      </div>

                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground md:hidden">
                          {t.transactions.columns.createdAt}
                        </span>
                        <span className="text-sm text-foreground">
                          {transaction.blockTime
                            ? formatDate(transaction.blockTime, {
                                dateStyle: "medium",
                                timeStyle: "short",
                              })
                            : t.transactions.timeUnavailable}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </>
  );
}

function CampaignDetailSkeleton() {
  return (
    <>
      <header className="mb-5">
        <ShimmerBlock className="mb-2 h-7 w-72 rounded" />
        <ShimmerBlock className="h-4 w-96 rounded" />
      </header>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <ShimmerBlock className="h-10 w-44 rounded-2xl" />
        <div className="flex gap-2">
          <ShimmerBlock className="h-10 w-28 rounded-2xl" />
          <ShimmerBlock className="h-10 w-28 rounded-2xl" />
        </div>
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <ShimmerBlock className="mb-3 h-3 w-24 rounded" />
              <ShimmerBlock className="h-8 w-32 rounded" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card p-6">
        <ShimmerBlock className="mb-2 h-3 w-40 rounded" />
        <ShimmerBlock className="mb-1 h-6 w-56 rounded" />
        <ShimmerBlock className="mb-4 h-4 w-80 rounded" />
        <div className="grid gap-3 md:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-background p-5"
            >
              <ShimmerBlock className="mb-3 h-3 w-20 rounded" />
              <ShimmerBlock className="h-7 w-24 rounded" />
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card p-6">
        <ShimmerBlock className="mb-6 h-5 w-48 rounded" />
        <ShimmerBlock className="h-[420px] w-full rounded-xl" />
      </section>
    </>
  );
}

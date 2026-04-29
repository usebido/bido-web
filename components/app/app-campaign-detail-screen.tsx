"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, ExternalLink, Pencil, Pause, Rocket, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useWallets } from "@privy-io/react-auth/solana";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
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
import { useI18n } from "@/components/providers/i18n-provider";
import { useCampaign, useCampaignActions, useCampaignAnalytics } from "@/lib/campaign-store";

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

function compactAddress(value: string | null) {
  if (!value) {
    return "Ainda não criado";
  }

  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function explorerUrl(address: string) {
  const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet";
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

export function AppCampaignDetailScreen({ campaignId }: { campaignId: string }) {
  const router = useRouter();
  const { formatCurrency } = useI18n();
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
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [usdcBalance, setUsdcBalance] = useState<number | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const {
    analytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useCampaignAnalytics(campaignId, selectedPeriod);
  const activeWallet = wallets[0] ?? null;
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
  const chartData = analytics?.series ?? [];
  const currentCampaign = campaign;
  const topMetrics = [
    {
      key: "recommendations",
      label: "CDR (Decision Rate)",
      value: `${analytics?.topMetrics.ctd.toFixed(1) ?? "0.0"}%`,
      change: 0,
    },
    {
      key: "decisions",
      label: "Loser Rate",
      value: `${analytics?.topMetrics.loserRate.toFixed(1) ?? "100.0"}%`,
      change: 3,
    },
    {
      key: "winRate",
      label: "Win Rate",
      value: `${analytics?.topMetrics.winRate.toFixed(1) ?? "0.0"}%`,
      change: 8,
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

        const [lamports, tokenBalance] = await Promise.all([
          connection.getBalance(owner, "confirmed"),
          connection.getTokenAccountBalance(ata, "confirmed").catch(() => null),
        ]);

        if (cancelled) {
          return;
        }

        setSolBalance(lamports / LAMPORTS_PER_SOL);
        setUsdcBalance(tokenBalance ? Number(tokenBalance.value.uiAmountString ?? "0") : 0);
      } catch (currentError) {
        if (cancelled) {
          return;
        }

        setBalanceError(
          currentError instanceof Error ? currentError.message : "Falha ao consultar saldo da wallet.",
        );
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
  }, [activeWallet?.address, walletsReady]);

  const requiredUsdc = currentCampaign?.monthlyBudget ?? 0;
  const effectiveSolBalance = activeWallet ? solBalance : null;
  const effectiveUsdcBalance = activeWallet ? usdcBalance : null;
  const hasEnoughUsdc = effectiveUsdcBalance !== null && effectiveUsdcBalance >= requiredUsdc;
  const activationDisabledReason = !walletsReady
    ? "Carregando wallet Solana..."
    : !activeWallet
      ? "Faça login com uma wallet Solana do Privy para ativar."
      : balanceLoading
        ? "Consultando saldo da wallet..."
        : balanceError
          ? "Não foi possível validar o saldo da wallet."
          : !hasEnoughUsdc
            ? `Essa wallet não tem USDC suficiente. Necessário: ${formatCurrency(requiredUsdc, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
              : null;
  const onchainLinks = [
    {
      label: "Campaign PDA",
      value: currentCampaign?.onchainCampaignPda ?? null,
    },
    {
      label: "Vault USDC",
      value: currentCampaign?.onchainVaultTokenAccount ?? null,
    },
    {
      label: "Program ID",
      value: currentCampaign?.onchainProgramId ?? null,
    },
  ].filter((item) => item.value);

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
          throw new Error("Nenhuma wallet Solana do Privy corresponde ao sponsor autenticado.");
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
      setFundingError(currentError instanceof Error ? currentError.message : "Falha ao ativar campanha.");
    } finally {
      setFundingPending(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        Carregando campanha...
      </div>
    );
  }

  if (!currentCampaign) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        {error ?? "Campaign not found."}
      </div>
    );
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
          Todas as campanhas
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {onchainLinks.length > 0 ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="lg">
                  On-chain
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
                        <span className="text-xs text-muted-foreground">{compactAddress(item.value)}</span>
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
      </div>

      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Campanha" value={currentCampaign.name} />
          <KpiCard label="Status" value={currentCampaign.status} />
          <KpiCard label="Budget" value={formatCurrency(currentCampaign.monthlyBudget, { currency: "USD" })} />
          <KpiCard
            label="Lance Máximo"
            value={formatCurrency(currentCampaign.maxBidPerDecision, {
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          />
        </div>
      </section>

      <section className="mt-5 rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Ativação On-Chain
            </p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {currentCampaign.onchainStatus === "funded_onchain" ? "Campanha ativada" : "Aguardando pagamento"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {currentCampaign.onchainStatus === "funded_onchain"
                ? "O budget já foi enviado em USDC para o programa Solana e a campanha está ativa."
                : `Envie ${formatCurrency(currentCampaign.monthlyBudget, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })} em USDC para ativar a campanha. O gas será pago via Kora.`}
            </p>
          </div>

          {currentCampaign.onchainStatus === "funded_onchain" ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-600">
              Funding confirmado
            </div>
          ) : (
            <div className="flex flex-col items-stretch gap-2">
              <button
                type="button"
                onClick={handleActivateCampaign}
                disabled={fundingPending || activationDisabledReason !== null}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-violet px-5 py-3 text-sm font-semibold text-violet-foreground transition-colors hover:bg-violet/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fundingPending ? <Wallet className="size-4 animate-pulse" /> : <Rocket className="size-4" />}
                {fundingPending ? "Assinando pagamento..." : "Ativar com USDC"}
              </button>
              {activationDisabledReason ? (
                <p className="max-w-sm text-sm text-amber-700">{activationDisabledReason}</p>
              ) : null}
            </div>
          )}
        </div>

        {!balanceLoading && activeWallet && currentCampaign.onchainStatus !== "funded_onchain" && !hasEnoughUsdc ? (
          <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700">
            Essa wallet do Privy ainda não tem saldo suficiente em USDC para ativar a campanha. Saldo atual:{" "}
            {formatCurrency(effectiveUsdcBalance ?? 0, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}. Necessário:{" "}
            {formatCurrency(requiredUsdc, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
          </div>
        ) : null}
        {!balanceLoading && activeWallet && currentCampaign.onchainStatus !== "funded_onchain" ? (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700">
            Gas patrocinado via Kora. Para ativar esta campanha, o usuário só precisa ter USDC suficiente na wallet do Privy.
          </div>
        ) : null}

        <div className="mt-4 grid gap-3 md:grid-cols-5">
          <KpiCard
            label="Budget On-Chain"
            value={
              currentCampaign.onchainStatus === "funded_onchain"
                ? formatCurrency(currentCampaign.monthlyBudget, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
                : formatCurrency(currentCampaign.monthlyBudget, { currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 })
            }
          />
          <KpiCard
            label="Custo por Decisão"
            value={formatCurrency(currentCampaign.maxBidPerDecision, {
              currency: "USD",
              minimumFractionDigits: 2,
              maximumFractionDigits: 4,
            })}
          />
          <KpiCard
            label="Saldo USDC"
            value={
              balanceLoading
                ? "Carregando..."
                : formatCurrency(effectiveUsdcBalance ?? 0, {
                    currency: "USD",
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })
            }
          />
          <KpiCard
            label="Saldo SOL"
            value={
              balanceLoading
                ? "Carregando..."
                : `${(effectiveSolBalance ?? 0).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 4,
                  })} SOL`
            }
          />
          <KpiCard
            label="Wallet Sponsor"
            value={
              activeWallet?.address
                ? compactAddress(activeWallet.address)
                : currentCampaign.sponsorWallet
                  ? compactAddress(currentCampaign.sponsorWallet)
                  : "Privy wallet"
            }
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
            {analyticsLoading ? (
              <div className="px-4 pb-6 text-sm text-muted-foreground">Carregando analytics...</div>
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
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, ChevronDown, ExternalLink, Pencil, Pause, Rocket, Shield, Trash2, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useWallets } from "@privy-io/react-auth/solana";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
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
import ProcessingCard from "@/components/ui/processing-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShimmerBlock } from "@/components/ui/animated-loading-skeleton";
import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { useI18n } from "@/components/providers/i18n-provider";
import { getDefaultUsdcMintAddress, getSolanaNetwork } from "@/lib/cloak-config";
import {
  canUsePreShieldedBalance,
  hasPendingPrivateCampaignFunding,
  runPrivateCampaignFunding,
  runResumePrivateCampaignFunding,
} from "@/lib/cloak-flow";
import { useCampaign, useCampaignActions, useCampaignAnalytics, useCampaignTransactions } from "@/lib/hooks/use-campaigns";
import { cn } from "@/lib/utils";

type FundingOverlayStatus = "queued" | "running" | "succeeded" | "failed";

type FundingOverlayState = {
  open: boolean;
  status: FundingOverlayStatus;
  progress: number;
  title: string;
  detail: string;
  signatureHint: string | null;
  mode: "activate" | "resume";
  flowType: "public" | "private";
  stepKey: string;
};

const PUBLIC_FLOW_STEPS = [
  { key: "prepare", label: "Prepare vault" },
  { key: "approve", label: "Approve wallet" },
  { key: "submit", label: "Submit funding" },
  { key: "confirm", label: "Confirm on-chain funding" },
  { key: "finalize", label: "Finish activation" },
] as const;

const PRIVATE_FLOW_STEPS = [
  { key: "prepare", label: "Prepare vault" },
  { key: "register", label: "Register viewing key" },
  { key: "shield", label: "Shield sponsor funds" },
  { key: "withdraw", label: "Withdraw privately" },
  { key: "fund", label: "Fund campaign vault" },
  { key: "finalize", label: "Finalize activation" },
] as const;

const INITIAL_FUNDING_OVERLAY: FundingOverlayState = {
  open: false,
  status: "queued",
  progress: 0,
  title: "Preparing private funding",
  detail: "The Cloak flow is getting ready.",
  signatureHint: null,
  mode: "activate",
  flowType: "private",
  stepKey: "prepare",
};

function delay(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function mapPrivateFundingProgress(status: string): Pick<
  FundingOverlayState,
  "progress" | "title" | "detail" | "stepKey"
> {
  if (status.startsWith("Registering Cloak viewing key")) {
    return {
      progress: 18,
      title: "Registering your Cloak view",
      detail: "Bido is linking a viewing key so this private flow remains auditable without exposing the sponsor trail.",
      stepKey: "register",
    };
  }

  if (status.startsWith("Using pre-shielded balance")) {
    return {
      progress: 32,
      title: "Using existing private balance",
      detail: "Your browser already has shielded USDC available, so the flow can skip the initial deposit.",
      stepKey: "shield",
    };
  }

  if (status.startsWith("Shielding USDC in Cloak")) {
    return {
      progress: 38,
      title: "Shielding sponsor funds",
      detail: "USDC is moving into Cloak before the campaign sees it, so the sponsor-to-campaign trail stays private.",
      stepKey: "shield",
    };
  }

  if (status.startsWith("Generating Cloak deposit proof")) {
    return {
      progress: 48,
      title: "Generating deposit proof",
      detail: status,
      stepKey: "shield",
    };
  }

  if (status.startsWith("Unshielding into ephemeral wallet")) {
    return {
      progress: 64,
      title: "Withdrawing privately",
      detail: "Cloak is moving the budget into a fresh temporary wallet that has no sponsor history on-chain.",
      stepKey: "withdraw",
    };
  }

  if (status.startsWith("Generating Cloak withdraw proof")) {
    return {
      progress: 76,
      title: "Generating withdraw proof",
      detail: status,
      stepKey: "withdraw",
    };
  }

  if (status.startsWith("Cloak root stale")) {
    return {
      progress: 74,
      title: "Refreshing private state",
      detail: "Cloak is retrying with a fresh root before continuing the withdraw.",
      stepKey: "withdraw",
    };
  }

  if (status.startsWith("Recovering ephemeral wallet")) {
    return {
      progress: 60,
      title: "Recovering interrupted private funding",
      detail: "The browser is restoring the temporary wallet created earlier so the vault can still receive the budget.",
      stepKey: "withdraw",
    };
  }

  if (status.startsWith("Funding campaign vault via Kora")) {
    return {
      progress: 88,
      title: "Funding the campaign vault",
      detail: "The private budget is being delivered to the campaign vault through the gas-sponsored Kora bundle.",
      stepKey: "fund",
    };
  }

  return {
    progress: 12,
    title: "Preparing private activation",
    detail: status,
    stepKey: "prepare",
  };
}

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
  const cluster = getSolanaNetwork();
  return `https://explorer.solana.com/address/${address}?cluster=${cluster}`;
}

function explorerTxUrl(signature: string) {
  const cluster = getSolanaNetwork();
  return `https://explorer.solana.com/tx/${signature}?cluster=${cluster}`;
}

function overlayStepState(index: number, currentIndex: number, status: FundingOverlayStatus) {
  if (status === "succeeded") {
    return "completed";
  }
  if (status === "failed" && index === currentIndex) {
    return "active";
  }
  if (index < currentIndex) {
    return "completed";
  }
  if (index === currentIndex) {
    return "active";
  }
  return "pending";
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
    setupCampaignPrivacy,
    confirmPrivacyDeposit,
    confirmPrivacyWithdraw,
    confirmPrivateFinalization,
    solanaChain,
  } = useCampaignActions();
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodKey>("30d");
  const [pauseConfirmOpen, setPauseConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fundingError, setFundingError] = useState<string | null>(null);
  const [fundingPending, setFundingPending] = useState(false);
  const [fundingOverlay, setFundingOverlay] = useState<FundingOverlayState>(INITIAL_FUNDING_OVERLAY);
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
        const usdcMintAddress =
          process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? getDefaultUsdcMintAddress();
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
  const isPrivateCampaign = currentCampaign?.privacyMode === "private_cloak";
  const usdcMintAddress =
    process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? getDefaultUsdcMintAddress();
  const pendingPrivateFunding =
    !!activeWallet?.address &&
    !!currentCampaign &&
    currentCampaign.privacyMode === "private_cloak" &&
    hasPendingPrivateCampaignFunding(activeWallet.address, currentCampaign.id);
  const preShieldedAvailable =
    !!activeWallet?.address &&
    !!currentCampaign &&
    currentCampaign.privacyMode === "private_cloak" &&
    canUsePreShieldedBalance(
      activeWallet.address,
      usdcMintAddress,
      currentCampaign.monthlyBudget,
    );
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
    privacy_deposit: "bg-indigo-500/10 text-indigo-700 ring-1 ring-indigo-500/20",
    privacy_withdrawal: "bg-cyan-500/10 text-cyan-700 ring-1 ring-cyan-500/20",
    privacy_finalization: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/20",
    settlement: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20",
    settlement_retry: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20",
    withdrawal: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/20",
    adjustment: "bg-surface text-foreground ring-1 ring-border",
  };
  const transactionKindLabels = t.transactions.kinds as Record<string, string>;

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

  function openFundingOverlay(mode: FundingOverlayState["mode"], initial: Partial<FundingOverlayState> = {}) {
    setFundingOverlay({
      ...INITIAL_FUNDING_OVERLAY,
      open: true,
      status: "running",
      mode,
      flowType: "private",
      ...initial,
    });
  }

  function updateFundingOverlay(next: Partial<FundingOverlayState>) {
    setFundingOverlay((current) => ({
      ...current,
      ...next,
    }));
  }

  function syncFundingOverlayProgress(status: string) {
    const mapped = mapPrivateFundingProgress(status);
    updateFundingOverlay({
      status: "running",
      signatureHint: null,
      ...mapped,
    });
  }

  async function finishFundingOverlay(status: FundingOverlayStatus, title: string, detail: string) {
    setFundingOverlay((current) => ({
      ...current,
      open: true,
      status,
      progress: status === "succeeded" ? 100 : current.progress,
      title,
      detail,
      signatureHint: null,
      stepKey: status === "succeeded" ? "finalize" : current.stepKey,
    }));

    await delay(status === "succeeded" ? 900 : 1300);
    setFundingOverlay((current) => ({ ...current, open: false }));
  }

  async function handleActivateCampaign() {
    if (!currentCampaign) {
      return;
    }

    setFundingPending(true);
    setFundingError(null);

    try {
      let txHash: string;
      let resolvedVaultUsdcAta = currentCampaign.onchainVaultTokenAccount;
      let resolvedCampaignPda = currentCampaign.onchainCampaignPda;
      let resolvedProgramId = currentCampaign.onchainProgramId;
      openFundingOverlay("activate", {
        flowType: currentCampaign.privacyMode === "private_cloak" ? "private" : "public",
        title:
          currentCampaign.privacyMode === "private_cloak"
            ? "Preparing private activation"
            : "Preparing campaign activation",
        detail:
          currentCampaign.privacyMode === "private_cloak"
            ? "Bido is checking the campaign vault and lining up the Cloak flow before asking for signatures."
            : "Bido is checking the campaign vault and preparing the funding transaction before asking for signatures.",
        progress: 4,
        stepKey: "prepare",
      });
      const runPreparedTransaction = async (prepared:
        | Awaited<ReturnType<typeof prepareCampaignInitialization>>
        | Awaited<ReturnType<typeof prepareCampaignFunding>>
      ) => {
        const sponsorWallet = wallets.find((wallet) => wallet.address === prepared.sponsorWallet);

        if (!sponsorWallet) {
          throw new Error(t.onchain.sponsorMismatch);
        }

        if (prepared.submissionMode === "kora" && prepared.koraSignerAddress) {
          updateFundingOverlay({
            progress: 8,
            title: "Waiting for wallet approval",
            detail:
              prepared === undefined
                ? "Approve the next transaction in your wallet."
                : "Approve the campaign transaction in your wallet so Bido can continue activation.",
            signatureHint: "A Privy signature request should be open now.",
            stepKey: "approve",
          });
          const signed = await sponsorWallet.signTransaction({
            transaction: decodeBase64ToBytes(prepared.txBase64),
            chain: solanaChain,
          });

          updateFundingOverlay({
            progress: 12,
            title: "Submitting signed transaction",
            detail: "The signed transaction is being relayed to the network.",
            signatureHint: null,
            stepKey: "submit",
          });
          const relayed = await relayCampaignFunding(
            currentCampaign.id,
            encodeBytesToBase64(signed.signedTransaction),
            prepared.koraSignerAddress,
          );
          return relayed.txHash;
        }

        updateFundingOverlay({
          progress: 8,
          title: "Waiting for wallet approval",
          detail: "Approve the campaign transaction in your wallet so Bido can continue activation.",
          signatureHint: "A Privy signature request should be open now.",
          stepKey: "approve",
        });
        const result = await sponsorWallet.signAndSendTransaction({
          transaction: decodeBase64ToBytes(prepared.txBase64),
          chain: solanaChain,
        });
        updateFundingOverlay({
          progress: 12,
          title: "Submitting signed transaction",
          detail: "The signed transaction is being sent to Solana.",
          signatureHint: null,
          stepKey: "submit",
        });
        return bs58.encode(result.signature);
      };

      const needsInitialization =
        !currentCampaign.onchainCampaignPda || !currentCampaign.onchainVaultTokenAccount;

      if (needsInitialization) {
        updateFundingOverlay({
          progress: 6,
          title: "Preparing campaign vault",
          detail: "The campaign still needs its vault accounts, so Bido is preparing the initialization transaction.",
          stepKey: "prepare",
        });
        const initialization = await prepareCampaignInitialization(currentCampaign.id);
        txHash = await runPreparedTransaction(initialization);
        updateFundingOverlay({
          progress: 14,
          title: "Confirming vault setup",
          detail:
            currentCampaign.privacyMode === "private_cloak"
              ? "The app is waiting for the campaign vault references to be confirmed before the Cloak flow begins."
              : "The app is waiting for the campaign vault references to be confirmed before funding starts.",
          stepKey: "prepare",
        });
        const confirmedInitialization = await confirmCampaignInitialization(currentCampaign.id, txHash);
        resolvedVaultUsdcAta =
          confirmedInitialization.onchainVaultTokenAccount ?? initialization.vaultUsdcAta;
        resolvedCampaignPda =
          confirmedInitialization.onchainCampaignPda ?? initialization.campaignPda;
        resolvedProgramId =
          confirmedInitialization.onchainProgramId ?? initialization.programId;
      }

      if (currentCampaign.privacyMode === "private_cloak") {
        if (!activeWallet?.signTransaction || !activeWallet.signMessage) {
          throw new Error("The connected wallet must support transaction and message signing for Cloak");
        }
        if (!resolvedVaultUsdcAta) {
          throw new Error("Campaign vault account is missing after initialization");
        }
        if (!resolvedCampaignPda || !resolvedProgramId) {
          throw new Error("Campaign PDA or program ID missing after initialization");
        }

        const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
        const usdcMintAddress =
          process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? getDefaultUsdcMintAddress();
        const connection = new Connection(rpcUrl, "confirmed");
        const walletPublicKey = new PublicKey(activeWallet.address);

        const cloakWallet = {
          address: activeWallet.address,
          publicKey: walletPublicKey,
          signMessage: async (message: Uint8Array) => {
            updateFundingOverlay({
              title: "Signature needed",
              detail: "Approve the Cloak authorization message in Privy to keep the private funding flow moving.",
              signatureHint: "Check your wallet modal and approve the message request.",
            });
            const result = await activeWallet.signMessage({ message });
            updateFundingOverlay({ signatureHint: null });
            return result.signature;
          },
          signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
            updateFundingOverlay({
              title: "Signature needed",
              detail: "Approve the next Cloak transaction in Privy. This is expected during private deposit or withdraw steps.",
              signatureHint: "Check your wallet modal and approve the transaction request.",
            });
            const serialized =
              transaction instanceof Transaction
                ? transaction.serialize({
                    verifySignatures: false,
                    requireAllSignatures: false,
                  })
                : transaction.serialize();

            const signed = await activeWallet.signTransaction({
              transaction: serialized,
              chain: solanaChain,
            });

            updateFundingOverlay({ signatureHint: null });
            return (transaction instanceof VersionedTransaction
              ? VersionedTransaction.deserialize(signed.signedTransaction)
              : Transaction.from(signed.signedTransaction)) as T;
          },
        };

        const cloakResult = await runPrivateCampaignFunding({
          campaignId: currentCampaign.id,
          budgetUsdc: currentCampaign.monthlyBudget,
          usdcMintAddress,
          vaultUsdcAta: resolvedVaultUsdcAta,
          campaignPda: resolvedCampaignPda,
          programId: resolvedProgramId,
          usePreShielded: preShieldedAvailable,
          connection,
          wallet: cloakWallet,
          onProgress: syncFundingOverlayProgress,
        });

        updateFundingOverlay({
          progress: 92,
          title: "Saving privacy metadata",
          detail: "The app is storing the Cloak references for this campaign so the private trail stays resumable and auditable.",
          stepKey: "fund",
        });
        await setupCampaignPrivacy(currentCampaign.id, {
          viewingKeyRegistered: true,
          viewingKeyReference: cloakResult.viewingKeyReference,
        });

        updateFundingOverlay({
          progress: 95,
          title: "Confirming private deposit",
          detail: "Bido is recording the shield deposit linked to this private campaign activation.",
          stepKey: "finalize",
        });
        await confirmPrivacyDeposit(currentCampaign.id, cloakResult.shieldSignature);
        updateFundingOverlay({
          progress: 97,
          title: "Confirming private withdraw",
          detail: "Bido is recording the private withdraw into the campaign funding path.",
          stepKey: "finalize",
        });
        await confirmPrivacyWithdraw(
          currentCampaign.id,
          cloakResult.withdrawSignature,
          cloakResult.fundedAmountAtomic,
        );

        updateFundingOverlay({
          progress: 99,
          title: "Finalizing private activation",
          detail: "The campaign budget is being marked as active on Bido after the private funding completed.",
          stepKey: "finalize",
        });
        await confirmPrivateFinalization(currentCampaign.id, cloakResult.fundSignature);
        txHash = cloakResult.fundSignature;
        await finishFundingOverlay(
          "succeeded",
          "Private campaign funded",
          "The Cloak flow completed and the campaign vault received the budget.",
        );
      } else {
        updateFundingOverlay({
          progress: 58,
          title: "Preparing campaign funding",
          detail: "Bido is building the direct funding transaction for the campaign vault.",
          stepKey: "submit",
        });
        const prepared = await prepareCampaignFunding(currentCampaign.id);
        txHash = await runPreparedTransaction(prepared);
        updateFundingOverlay({
          progress: 88,
          title: "Confirming campaign funding",
          detail: "The app is waiting for the on-chain funding confirmation before finishing activation.",
          stepKey: "confirm",
        });
        await confirmCampaignFunding(currentCampaign.id, txHash);
        await finishFundingOverlay(
          "succeeded",
          "Campaign activated",
          "The campaign vault was funded and the activation completed on-chain.",
        );
      }
    } catch (currentError) {
      await finishFundingOverlay(
        "failed",
        currentCampaign.privacyMode === "private_cloak" ? "Private funding failed" : "Campaign activation failed",
        currentError instanceof Error ? currentError.message : t.onchain.activationFailed,
      );
      setFundingError(currentError instanceof Error ? currentError.message : t.onchain.activationFailed);
    } finally {
      setFundingPending(false);
    }
  }

  async function handleResumePrivateFunding() {
    if (!currentCampaign) {
      return;
    }
    if (!activeWallet?.signTransaction || !activeWallet.signMessage) {
      setFundingError("The connected wallet must support transaction and message signing for Cloak");
      return;
    }
    if (
      !currentCampaign.onchainVaultTokenAccount ||
      !currentCampaign.onchainCampaignPda ||
      !currentCampaign.onchainProgramId
    ) {
      setFundingError("Campaign is missing on-chain references to resume private funding");
      return;
    }

    setFundingPending(true);
    setFundingError(null);
    openFundingOverlay("resume", {
      flowType: "private",
      title: "Resuming private funding",
      detail: "Bido is reopening the interrupted Cloak flow from this browser state.",
      progress: 52,
      stepKey: "withdraw",
    });

    try {
      const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? DEFAULT_SOLANA_RPC_URL;
      const usdcMintAddress =
        process.env.NEXT_PUBLIC_SOLANA_USDC_MINT ?? getDefaultUsdcMintAddress();
      const connection = new Connection(rpcUrl, "confirmed");
      const walletPublicKey = new PublicKey(activeWallet.address);

      const cloakWallet = {
        address: activeWallet.address,
        publicKey: walletPublicKey,
        signMessage: async (message: Uint8Array) => {
          updateFundingOverlay({
            title: "Signature needed",
            detail: "Approve the recovery message in Privy so Bido can restore the temporary Cloak wallet.",
            signatureHint: "Check your wallet modal and approve the message request.",
          });
          const signResult = await activeWallet.signMessage({ message });
          updateFundingOverlay({ signatureHint: null });
          return signResult.signature;
        },
        signTransaction: async <T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> => {
          updateFundingOverlay({
            title: "Signature needed",
            detail: "Approve the resumed Cloak transaction in Privy to continue the private funding flow.",
            signatureHint: "Check your wallet modal and approve the transaction request.",
          });
          const serialized =
            transaction instanceof Transaction
              ? transaction.serialize({
                  verifySignatures: false,
                  requireAllSignatures: false,
                })
              : transaction.serialize();

          const signed = await activeWallet.signTransaction({
            transaction: serialized,
            chain: solanaChain,
          });

          updateFundingOverlay({ signatureHint: null });
          return (transaction instanceof VersionedTransaction
            ? VersionedTransaction.deserialize(signed.signedTransaction)
            : Transaction.from(signed.signedTransaction)) as T;
        },
      };

      const result = await runResumePrivateCampaignFunding({
        campaignId: currentCampaign.id,
        usdcMintAddress,
        vaultUsdcAta: currentCampaign.onchainVaultTokenAccount,
        campaignPda: currentCampaign.onchainCampaignPda,
        programId: currentCampaign.onchainProgramId,
        connection,
        wallet: cloakWallet,
        onProgress: syncFundingOverlayProgress,
      });

      updateFundingOverlay({
        progress: 99,
        title: "Finalizing resumed activation",
        detail: "The recovered private budget is being committed to the campaign record.",
        stepKey: "finalize",
      });
      await confirmPrivateFinalization(currentCampaign.id, result.fundSignature);
      await finishFundingOverlay(
        "succeeded",
        "Private funding resumed",
        "The interrupted Cloak flow was recovered and the campaign vault received the budget.",
      );
    } catch (currentError) {
      await finishFundingOverlay(
        "failed",
        "Resume failed",
        currentError instanceof Error ? currentError.message : t.onchain.activationFailed,
      );
      setFundingError(currentError instanceof Error ? currentError.message : t.onchain.activationFailed);
    } finally {
      setFundingPending(false);
    }
  }

  if (loading && !currentCampaign) {
    return <CampaignDetailSkeleton />;
  }

  if (!currentCampaign) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        {error ?? t.campaignNotFound}
      </div>
    );
  }

  const fundingModeLabel = t.fundingModes[currentCampaign.privacyMode];
  const overlaySteps = fundingOverlay.flowType === "private" ? PRIVATE_FLOW_STEPS : PUBLIC_FLOW_STEPS;
  const overlayCurrentIndex = overlaySteps.findIndex((item) => item.key === fundingOverlay.stepKey);

  return (
    <>
      {fundingOverlay.open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/72 px-4 py-6 backdrop-blur-md">
          <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-5xl overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl shadow-black/70">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_420px]">
              <div className="border-b border-border p-6 lg:border-r lg:border-b-0 lg:p-8">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet/20 bg-violet-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-violet">
                  <Shield className="size-3.5" />
                  {fundingOverlay.flowType === "private" ? "Cloak Private Funding" : "Campaign Activation"}
                </div>
                <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground">
                  {fundingOverlay.title}
                </h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
                  {fundingOverlay.detail}
                </p>

                <div className="mt-6 rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-2xl border",
                        fundingOverlay.signatureHint
                          ? "border-amber-500/20 bg-amber-500/10 text-amber-700"
                          : "border-violet/20 bg-violet-soft text-violet",
                      )}
                    >
                      {fundingOverlay.signatureHint ? (
                        <Wallet className="size-4" />
                      ) : (
                        <CheckCircle2 className="size-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {fundingOverlay.signatureHint ? "Wallet action required" : "Flow running in-browser"}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {fundingOverlay.signatureHint ??
                          (fundingOverlay.flowType === "private"
                            ? "This private flow is executing non-custodially in the browser. The screen will update as Cloak and Bido move through each stage."
                            : "This activation is running in-browser. The screen will update as Bido prepares, signs, submits, and confirms the campaign funding.")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 space-y-3">
                  {overlaySteps.map((step, index) => {
                    const state = overlayStepState(index, overlayCurrentIndex, fundingOverlay.status);

                    return (
                      <div
                        key={step.key}
                        className={cn(
                          "flex items-center justify-between rounded-2xl border px-4 py-3 transition-colors",
                          state === "completed"
                            ? "border-violet/20 bg-violet-soft text-foreground"
                            : state === "active"
                              ? "border-violet/25 bg-surface text-foreground"
                              : "border-border bg-surface-2 text-muted-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-7 items-center justify-center rounded-full border text-xs font-semibold",
                              state === "completed"
                                ? "border-violet/20 bg-violet-soft text-violet"
                                : state === "active"
                                  ? "border-violet/20 bg-violet/10 text-violet"
                                  : "border-border bg-surface text-muted-foreground",
                            )}
                          >
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium">{step.label}</span>
                        </div>
                        <span className="text-xs uppercase tracking-[0.16em]">
                          {state === "completed" ? "Done" : state === "active" ? "Live" : "Pending"}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {fundingOverlay.status === "failed" ? (
                  <div className="mt-6 flex justify-end">
                    <Button variant="outline" onClick={() => setFundingOverlay((current) => ({ ...current, open: false }))}>
                      Close
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="p-4 lg:p-6">
                <ProcessingCard
                  name={
                    fundingOverlay.mode === "resume"
                      ? "CloakRecovery"
                      : fundingOverlay.flowType === "private"
                        ? "CloakActivation"
                        : "CampaignActivation"
                  }
                  status={fundingOverlay.status}
                  progress={fundingOverlay.progress}
                  label={fundingOverlay.title}
                  detail={fundingOverlay.detail}
                  className="border-border bg-surface-2 shadow-black/30"
                />
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">{currentCampaign.name}</h1>
          <span className="inline-flex items-center rounded-full border border-violet/20 bg-violet/10 px-3 py-1 text-xs font-medium text-violet">
            {fundingModeLabel}
          </span>
        </div>
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

      {pendingPrivateFunding && currentCampaign.onchainStatus !== "funded_onchain" ? (
        <section className="mt-5 rounded-2xl border border-amber-500/40 bg-amber-500/5 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-amber-700">
                Private funding interrupted
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
                Resume to deliver the budget
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your USDC was shielded into Cloak and unshielded to a temporary wallet on this
                device, but the campaign vault never received it. Click below to sign the recovery
                message and finish funding. Until you do, the funds are stuck in the temporary
                wallet on this browser.
              </p>
            </div>
            <div className="flex flex-col items-stretch gap-2">
              <button
                type="button"
                onClick={handleResumePrivateFunding}
                disabled={fundingPending}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-500/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {fundingPending ? <Wallet className="size-4 animate-pulse" /> : <Rocket className="size-4" />}
                {fundingPending ? t.onchain.signing : "Resume private funding"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {!pendingPrivateFunding && currentCampaign.onchainStatus !== "funded_onchain" ? (
        <section className="mt-5 rounded-2xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t.onchain.sectionLabel}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-foreground">{t.onchain.pending}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {isPrivateCampaign && preShieldedAvailable
                  ? `Your pre-shielded private balance covers this budget. Activating will skip the shield step and consume from your private balance for better privacy.`
                  : isPrivateCampaign
                  ? `This campaign uses the Cloak private funding flow. Initialize the vault, confirm the shield deposit and private withdraw, then finalize the budget on-chain for ${formatCurrency(
                      currentCampaign.monthlyBudget,
                      {
                        currency: "USD",
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      },
                    )}.`
                  : replace(t.onchain.pendingDescription, {
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
            <KpiCard
              label="Privacy status"
              value={currentCampaign.privacyFundingStatus.replaceAll("_", " ")}
            />
          </div>

          {isPrivateCampaign ? (
            <div className="mt-4 rounded-2xl border border-sky-500/30 bg-sky-500/5 px-4 py-3 text-sm text-sky-800">
              <p>
                Cloak runs non-custodially in the frontend. The app registers the viewing key,
                shields the sponsor USDC with the official SDK, withdraws privately into the
                campaign vault, and only then finalizes the budget accounting on the Bido program.
              </p>
              {currentCampaign.cloakViewingKeyRegisteredAt ? (
                <p className="mt-2">
                  Viewing key registered at{" "}
                  {formatDate(currentCampaign.cloakViewingKeyRegisteredAt, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  .
                </p>
              ) : null}
              {currentCampaign.cloakWithdrawTxHash ? (
                <p className="mt-2">
                  Last withdraw:{" "}
                  <a
                    href={explorerTxUrl(currentCampaign.cloakWithdrawTxHash)}
                    target="_blank"
                    rel="noreferrer"
                    className="font-medium underline underline-offset-4"
                  >
                    {compactAddress(currentCampaign.cloakWithdrawTxHash, currentCampaign.cloakWithdrawTxHash)}
                  </a>
                </p>
              ) : null}
            </div>
          ) : null}
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
                          {transactionKindLabels[transaction.kind] ??
                            transaction.kind.replaceAll("_", " ")}
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

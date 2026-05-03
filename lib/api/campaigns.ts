import {
  type ApiCampaign,
  type ApiCampaignTransaction,
  type CampaignAnalyticsResponse,
  type CampaignSummaryResponse,
} from "@/lib/app-campaign-data";
import type { CampaignFormData } from "@/lib/campaign-types";
import { bidoFetch, type GetAccessToken } from "./client";

export type AnalyticsPeriod = "7d" | "30d" | "90d";

export type PrepareInitializationResponse = {
  txBase64: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
  sponsorWallet: string;
  feePayer: string;
  submissionMode: "direct" | "kora";
  koraSignerAddress?: string;
  campaignPda: string;
  vaultUsdcAta: string;
  usdcMint: string;
  programId: string;
};

export type PrepareFundingResponse = {
  txBase64: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
  sponsorWallet: string;
  feePayer: string;
  submissionMode: "direct" | "kora";
  koraSignerAddress?: string;
  sponsorUsdcAta: string;
  campaignPda: string;
  vaultUsdcAta: string;
  amountAtomic: string;
  amountUsdc: number;
  usdcMint: string;
  programId: string;
};

export type PreparePrivateFinalizationResponse = {
  txBase64: string;
  recentBlockhash: string;
  lastValidBlockHeight: number;
  sponsorWallet: string;
  feePayer: string;
  submissionMode: "direct" | "kora";
  koraSignerAddress?: string;
  campaignPda: string;
  vaultUsdcAta: string;
  usdcMint: string;
  programId: string;
  accountedVaultBalanceAtomic: string;
  budgetSpentAtomic: string;
};

export const campaignsApi = {
  list: (token: GetAccessToken) =>
    bidoFetch<ApiCampaign[]>(token, "/campaigns"),

  get: (token: GetAccessToken, id: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}`),

  transactions: (token: GetAccessToken, id: string, limit = 50) =>
    bidoFetch<ApiCampaignTransaction[]>(
      token,
      `/campaigns/${id}/transactions?limit=${limit}`,
    ),

  summary: (token: GetAccessToken) =>
    bidoFetch<CampaignSummaryResponse>(token, "/campaigns/summary"),

  analytics: (
    token: GetAccessToken,
    id: string,
    period: AnalyticsPeriod = "30d",
  ) =>
    bidoFetch<CampaignAnalyticsResponse>(
      token,
      `/campaigns/${id}/analytics?period=${period}`,
    ),

  create: (token: GetAccessToken, form: CampaignFormData) =>
    bidoFetch<ApiCampaign>(token, "/campaigns", {
      method: "POST",
      body: JSON.stringify(form),
    }),

  update: (token: GetAccessToken, id: string, form: CampaignFormData) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}`, {
      method: "PATCH",
      body: JSON.stringify(form),
    }),

  remove: (token: GetAccessToken, id: string) =>
    bidoFetch<void>(token, `/campaigns/${id}`, { method: "DELETE" }),

  pause: (token: GetAccessToken, id: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/pause`, {
      method: "POST",
    }),

  resume: (token: GetAccessToken, id: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/resume`, {
      method: "POST",
    }),

  prepareInit: (token: GetAccessToken, id: string, feePayer?: string) =>
    bidoFetch<PrepareInitializationResponse>(
      token,
      `/campaigns/${id}/onchain/initialize/prepare`,
      {
        method: "POST",
        body: JSON.stringify(feePayer ? { feePayer } : {}),
      },
    ),

  confirmInit: (token: GetAccessToken, id: string, txHash: string) =>
    bidoFetch<ApiCampaign>(
      token,
      `/campaigns/${id}/onchain/initialize/confirm`,
      {
        method: "POST",
        body: JSON.stringify({ txHash }),
      },
    ),

  setupPrivacy: (
    token: GetAccessToken,
    id: string,
    payload: { viewingKeyRegistered?: boolean; viewingKeyReference?: string } = {},
  ) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/privacy/setup`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  confirmPrivacyDeposit: (token: GetAccessToken, id: string, txHash: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/privacy/deposit/confirm`, {
      method: "POST",
      body: JSON.stringify({ txHash }),
    }),

  confirmPrivacyWithdraw: (
    token: GetAccessToken,
    id: string,
    txHash: string,
    withdrawAmountAtomic: string,
  ) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/privacy/withdraw/confirm`, {
      method: "POST",
      body: JSON.stringify({ txHash, withdrawAmountAtomic }),
    }),

  prepareFunding: (token: GetAccessToken, id: string, feePayer?: string) =>
    bidoFetch<PrepareFundingResponse>(
      token,
      `/campaigns/${id}/onchain/prepare`,
      {
        method: "POST",
        body: JSON.stringify(feePayer ? { feePayer } : {}),
      },
    ),

  relayFunding: (
    token: GetAccessToken,
    id: string,
    signedTxBase64: string,
    signerAddress: string,
  ) =>
    bidoFetch<{ txHash: string }>(
      token,
      `/campaigns/${id}/onchain/relay`,
      {
        method: "POST",
        body: JSON.stringify({ signedTxBase64, signerAddress }),
      },
    ),

  confirmFunding: (token: GetAccessToken, id: string, txHash: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/onchain/confirm`, {
      method: "POST",
      body: JSON.stringify({ txHash }),
    }),

  preparePrivateFinalization: (token: GetAccessToken, id: string, feePayer?: string) =>
    bidoFetch<PreparePrivateFinalizationResponse>(
      token,
      `/campaigns/${id}/onchain/private-finalize/prepare`,
      {
        method: "POST",
        body: JSON.stringify(feePayer ? { feePayer } : {}),
      },
    ),

  confirmPrivateFinalization: (token: GetAccessToken, id: string, txHash: string) =>
    bidoFetch<ApiCampaign>(token, `/campaigns/${id}/onchain/private-finalize/confirm`, {
      method: "POST",
      body: JSON.stringify({ txHash }),
    }),
};

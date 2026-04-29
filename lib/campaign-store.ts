"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type ApiCampaign,
  type ApiCampaignStatus,
  type CampaignAnalyticsResponse,
  type CampaignRecord,
  type CampaignSummaryResponse,
  mapApiCampaignToRecord,
} from "@/lib/app-campaign-data";
import { INITIAL_FORM, type CampaignFormData } from "@/lib/campaign-types";

const CHANGE_EVENT = "bido-campaigns:changed";
const API_BASE = process.env.NEXT_PUBLIC_BIDO_API_BASE ?? "http://localhost:3001/api";
const SOLANA_CHAIN = `solana:${process.env.NEXT_PUBLIC_SOLANA_NETWORK ?? "devnet"}` as const;

const INTENT_LABELS: Record<string, string> = {
  viagens: "Viagens",
  ecommerce: "E-commerce",
  saas: "SaaS",
  financas: "Finanças",
  educacao: "Educação",
};

class BidoApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

function emitCampaignChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function useCampaignChangeListener(onChange: () => void) {
  useEffect(() => {
    window.addEventListener(CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CHANGE_EVENT, onChange);
  }, [onChange]);
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") {
      return payload.message;
    }
    if (Array.isArray(payload?.message)) {
      return payload.message.join(", ");
    }
  } catch {
    return response.statusText;
  }

  return response.statusText;
}

async function requestApi<T>(
  getAccessToken: () => Promise<string | null>,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Privy access token unavailable.");
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new BidoApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function fetchCampaignAnalytics(
  getAccessToken: () => Promise<string | null>,
  campaignId: string,
  period: "7d" | "30d" | "90d" = "30d",
) {
  return requestApi<CampaignAnalyticsResponse>(
    getAccessToken,
    `/campaigns/${campaignId}/analytics?period=${period}`,
  );
}

async function fetchCampaignRecord(
  getAccessToken: () => Promise<string | null>,
  campaign: ApiCampaign,
) {
  const analytics = await fetchCampaignAnalytics(getAccessToken, campaign.id, "30d");
  return mapApiCampaignToRecord(campaign, analytics);
}

function toErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unexpected error while loading campaigns.";
}

export function campaignToForm(campaign: CampaignRecord): CampaignFormData {
  return {
    brandName: campaign.name,
    offerText: campaign.summary,
    destinationUrl: campaign.destinationUrl,
    location: campaign.geo || INITIAL_FORM.location,
    intentCategory: campaign.intentCategory,
    totalBudget: campaign.monthlyBudget,
    queryBid: campaign.maxBidPerDecision || INITIAL_FORM.queryBid,
  };
}

function scheduleLoad(load: () => Promise<void>) {
  const timeoutId = window.setTimeout(() => {
    void load();
  }, 0);

  return () => window.clearTimeout(timeoutId);
}

export function useCampaigns() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [campaigns, setCampaigns] = useState<CampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaigns = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      setCampaigns([]);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const items = await requestApi<ApiCampaign[]>(getAccessToken, "/campaigns");
      const records = await Promise.all(items.map((item) => fetchCampaignRecord(getAccessToken, item)));
      setCampaigns(records);
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken, ready]);

  useEffect(() => scheduleLoad(loadCampaigns), [loadCampaigns]);

  useCampaignChangeListener(() => {
    void loadCampaigns();
  });

  return { campaigns, loading, error, reload: loadCampaigns };
}

export function useCampaignSummary() {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [summary, setSummary] = useState<CampaignSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      setSummary(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setSummary(await requestApi<CampaignSummaryResponse>(getAccessToken, "/campaigns/summary"));
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [authenticated, getAccessToken, ready]);

  useEffect(() => scheduleLoad(loadSummary), [loadSummary]);

  useCampaignChangeListener(() => {
    void loadSummary();
  });

  return { summary, loading, error, reload: loadSummary };
}

export function useCampaign(campaignId: string) {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [campaign, setCampaign] = useState<CampaignRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      setCampaign(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const item = await requestApi<ApiCampaign>(getAccessToken, `/campaigns/${campaignId}`);
      setCampaign(await fetchCampaignRecord(getAccessToken, item));
    } catch (loadError) {
      setCampaign(null);
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [authenticated, campaignId, getAccessToken, ready]);

  useEffect(() => scheduleLoad(loadCampaign), [loadCampaign]);

  useCampaignChangeListener(() => {
    void loadCampaign();
  });

  return { campaign, loading, error, reload: loadCampaign };
}

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

export function useCampaignAnalytics(campaignId: string, period: "7d" | "30d" | "90d") {
  const { ready, authenticated, getAccessToken } = usePrivy();
  const [analytics, setAnalytics] = useState<CampaignAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!ready) {
      return;
    }

    if (!authenticated) {
      setAnalytics(null);
      setError(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setAnalytics(await fetchCampaignAnalytics(getAccessToken, campaignId, period));
    } catch (loadError) {
      setAnalytics(null);
      setError(toErrorMessage(loadError));
    } finally {
      setLoading(false);
    }
  }, [authenticated, campaignId, getAccessToken, period, ready]);

  useEffect(() => scheduleLoad(loadAnalytics), [loadAnalytics]);

  useCampaignChangeListener(() => {
    void loadAnalytics();
  });

  return { analytics, loading, error, reload: loadAnalytics };
}

export function useCampaignActions() {
  const { getAccessToken } = usePrivy();

  const createCampaign = useCallback(
    async (form: CampaignFormData) => {
      const created = await requestApi<ApiCampaign>(getAccessToken, "/campaigns", {
        method: "POST",
        body: JSON.stringify(form),
      });
      emitCampaignChange();
      return created;
    },
    [getAccessToken],
  );

  const editCampaign = useCallback(
    async (id: string, form: CampaignFormData) => {
      const updated = await requestApi<ApiCampaign>(getAccessToken, `/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      emitCampaignChange();
      return updated;
    },
    [getAccessToken],
  );

  const removeCampaign = useCallback(
    async (id: string) => {
      await requestApi<ApiCampaign>(getAccessToken, `/campaigns/${id}`, {
        method: "DELETE",
      });
      emitCampaignChange();
    },
    [getAccessToken],
  );

  const pauseCampaign = useCallback(
    async (id: string, currentStatus: ApiCampaignStatus) => {
      const path = currentStatus === "paused" ? `/campaigns/${id}/resume` : `/campaigns/${id}/pause`;
      const updated = await requestApi<ApiCampaign>(getAccessToken, path, {
        method: "POST",
      });
      emitCampaignChange();
      return updated;
    },
    [getAccessToken],
  );

  const prepareCampaignFunding = useCallback(
    async (id: string, feePayer?: string) =>
      requestApi<PrepareFundingResponse>(getAccessToken, `/campaigns/${id}/onchain/prepare`, {
        method: "POST",
        body: JSON.stringify(feePayer ? { feePayer } : {}),
      }),
    [getAccessToken],
  );

  const prepareCampaignInitialization = useCallback(
    async (id: string, feePayer?: string) =>
      requestApi<PrepareInitializationResponse>(
        getAccessToken,
        `/campaigns/${id}/onchain/initialize/prepare`,
        {
          method: "POST",
          body: JSON.stringify(feePayer ? { feePayer } : {}),
        },
      ),
    [getAccessToken],
  );

  const confirmCampaignFunding = useCallback(
    async (id: string, txHash: string) => {
      const updated = await requestApi<ApiCampaign>(getAccessToken, `/campaigns/${id}/onchain/confirm`, {
        method: "POST",
        body: JSON.stringify({ txHash }),
      });
      emitCampaignChange();
      return updated;
    },
    [getAccessToken],
  );

  const relayCampaignFunding = useCallback(
    async (id: string, signedTxBase64: string, signerAddress: string) =>
      requestApi<{ txHash: string }>(getAccessToken, `/campaigns/${id}/onchain/relay`, {
        method: "POST",
        body: JSON.stringify({ signedTxBase64, signerAddress }),
      }),
    [getAccessToken],
  );

  const confirmCampaignInitialization = useCallback(
    async (id: string, txHash: string) => {
      const updated = await requestApi<ApiCampaign>(
        getAccessToken,
        `/campaigns/${id}/onchain/initialize/confirm`,
        {
          method: "POST",
          body: JSON.stringify({ txHash }),
        },
      );
      emitCampaignChange();
      return updated;
    },
    [getAccessToken],
  );

  return useMemo(
    () => ({
      createCampaign,
      editCampaign,
      pauseCampaign,
      removeCampaign,
      prepareCampaignInitialization,
      confirmCampaignInitialization,
      prepareCampaignFunding,
      relayCampaignFunding,
      confirmCampaignFunding,
      solanaChain: SOLANA_CHAIN,
    }),
    [
      confirmCampaignFunding,
      confirmCampaignInitialization,
      createCampaign,
      editCampaign,
      pauseCampaign,
      prepareCampaignFunding,
      prepareCampaignInitialization,
      relayCampaignFunding,
      removeCampaign,
    ],
  );
}

export function formToCampaignUpdate(form: CampaignFormData): Partial<CampaignRecord> {
  return {
    name: form.brandName,
    destinationUrl: form.destinationUrl,
    intentCategory: form.intentCategory,
    segment: INTENT_LABELS[form.intentCategory] ?? form.intentCategory,
    monthlyBudget: form.totalBudget,
    costPerDecision: form.queryBid,
    summary: form.offerText,
    updatedAt: new Date().toISOString(),
  };
}

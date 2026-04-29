"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { campaigns, type CampaignRecord } from "@/lib/app-campaign-data";
import { INITIAL_FORM, type CampaignFormData } from "@/lib/campaign-types";

const STORAGE_KEY = "bido-campaigns";
const CHANGE_EVENT = "bido-campaigns:changed";

function isBrowser() {
  return typeof window !== "undefined";
}

function cloneDefaults() {
  return campaigns.map((campaign) => ({ ...campaign }));
}

function normalizeCampaigns(value: unknown): CampaignRecord[] | null {
  if (!Array.isArray(value)) {
    return null;
  }

  return value as CampaignRecord[];
}

export function readCampaigns(): CampaignRecord[] {
  if (!isBrowser()) {
    return cloneDefaults();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return cloneDefaults();
    }

    const parsed = JSON.parse(raw);
    return normalizeCampaigns(parsed) ?? cloneDefaults();
  } catch {
    return cloneDefaults();
  }
}

function writeCampaigns(nextCampaigns: CampaignRecord[]) {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCampaigns));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function updateCampaignList(updater: (current: CampaignRecord[]) => CampaignRecord[]) {
  const current = readCampaigns();
  const next = updater(current);
  writeCampaigns(next);
  return next;
}

const INTENT_LABELS: Record<string, string> = {
  viagens: "Viagens",
  ecommerce: "E-commerce",
  saas: "SaaS",
  financas: "Finanças",
  educacao: "Educação",
};

export function campaignToForm(campaign: CampaignRecord): CampaignFormData {
  return {
    brandName: campaign.name,
    offerText: campaign.summary,
    destinationUrl: campaign.destinationUrl,
    location: campaign.geo || INITIAL_FORM.location,
    intentCategory: campaign.intentCategory,
    totalBudget: campaign.monthlyBudget,
    queryBid: campaign.costPerDecision,
  };
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

export function saveCampaign(id: string, updates: Partial<CampaignRecord>) {
  return updateCampaignList((current) =>
    current.map((campaign) => (campaign.id === id ? { ...campaign, ...updates } : campaign)),
  );
}

export function deleteCampaign(id: string) {
  return updateCampaignList((current) => current.filter((campaign) => campaign.id !== id));
}

export function useCampaigns() {
  const [items, setItems] = useState<CampaignRecord[]>(() => readCampaigns());

  useEffect(() => {
    const sync = () => setItems(readCampaigns());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    return () => window.removeEventListener(CHANGE_EVENT, sync);
  }, []);

  return items;
}

export function useCampaign(id: string, fallback: CampaignRecord) {
  const items = useCampaigns();
  return useMemo(() => items.find((campaign) => campaign.id === id) ?? fallback, [fallback, id, items]);
}

export function useCampaignActions() {
  const pauseCampaign = useCallback((id: string) => {
    const item = readCampaigns().find((campaign) => campaign.id === id);
    if (!item) {
      return;
    }

    saveCampaign(id, {
      status: item.status === "Pausada" ? "Ativa" : "Pausada",
      updatedAt: new Date().toISOString(),
    });
  }, []);

  const removeCampaign = useCallback((id: string) => {
    deleteCampaign(id);
  }, []);

  const editCampaign = useCallback((id: string, form: CampaignFormData) => {
    saveCampaign(id, formToCampaignUpdate(form));
  }, []);

  return {
    editCampaign,
    pauseCampaign,
    removeCampaign,
  };
}

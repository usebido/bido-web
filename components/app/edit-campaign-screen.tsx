"use client";

import { campaignToForm, useCampaign } from "@/lib/campaign-store";
import { NewCampaignScreen } from "@/components/app/new-campaign-screen";

export function EditCampaignScreen({ campaignId }: { campaignId: string }) {
  const { campaign, loading, error } = useCampaign(campaignId);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        Carregando campanha...
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="rounded-2xl border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">
        {error ?? "Campaign not found."}
      </div>
    );
  }

  return (
    <NewCampaignScreen
      mode="edit"
      campaignId={campaign.id}
      initialForm={campaignToForm(campaign)}
    />
  );
}

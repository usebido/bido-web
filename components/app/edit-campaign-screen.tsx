"use client";

import type { CampaignRecord } from "@/lib/app-campaign-data";
import { campaignToForm, useCampaign } from "@/lib/campaign-store";
import { NewCampaignScreen } from "@/components/app/new-campaign-screen";

export function EditCampaignScreen({ campaign }: { campaign: CampaignRecord }) {
  const currentCampaign = useCampaign(campaign.id, campaign);

  return (
    <NewCampaignScreen
      mode="edit"
      campaignId={currentCampaign.id}
      initialForm={campaignToForm(currentCampaign)}
    />
  );
}

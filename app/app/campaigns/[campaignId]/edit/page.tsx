import { EditCampaignScreen } from "@/components/app/edit-campaign-screen";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return <EditCampaignScreen campaignId={campaignId} />;
}

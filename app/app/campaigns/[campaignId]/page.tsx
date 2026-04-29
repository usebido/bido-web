import { AppCampaignDetailScreen } from "@/components/app/app-campaign-detail-screen";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;

  return <AppCampaignDetailScreen campaignId={campaignId} />;
}

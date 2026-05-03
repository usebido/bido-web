export type CampaignObjective = "traffic" | "lead_generation" | "awareness";
export type DeviceTarget = "all" | "custom";
export type CampaignPrivacyMode = "public_direct" | "private_cloak";

export interface CampaignFormData {
  brandName: string;
  offerText: string;
  destinationUrl: string;
  location: string;
  intentCategory: string;
  totalBudget: number;
  queryBid: number;
  privacyMode: CampaignPrivacyMode;
}

export const INITIAL_FORM: CampaignFormData = {
  brandName: "",
  offerText: "",
  destinationUrl: "",
  location: "Global",
  intentCategory: "",
  totalBudget: 1000,
  queryBid: 0.5,
  privacyMode: "private_cloak",
};

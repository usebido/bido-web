export type CampaignObjective = "traffic" | "lead_generation" | "awareness";
export type DeviceTarget = "all" | "custom";
export type CampaignPrivacyMode = "private_cloak" | "public_direct";

export interface CampaignFormData {
  brandName: string;
  productDescription: string;
  destinationUrl: string;
  location: string;
  intentCategory: string;
  totalBudget: number;
  queryBid: number;
  privacyMode: CampaignPrivacyMode;
}

export const INITIAL_FORM: CampaignFormData = {
  brandName: "",
  productDescription: "",
  destinationUrl: "",
  location: "Global",
  intentCategory: "",
  totalBudget: 1000,
  queryBid: 0.5,
  privacyMode: "private_cloak",
};

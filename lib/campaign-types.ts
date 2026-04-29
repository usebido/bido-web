export type CampaignObjective = "traffic" | "lead_generation" | "awareness";
export type DeviceTarget = "all" | "custom";

export interface CampaignFormData {
  brandName: string;
  offerText: string;
  destinationUrl: string;
  location: string;
  intentCategory: string;
  totalBudget: number;
  queryBid: number;
}

export const INITIAL_FORM: CampaignFormData = {
  brandName: "",
  offerText: "",
  destinationUrl: "",
  location: "Global",
  intentCategory: "",
  totalBudget: 1000,
  queryBid: 0.5,
};

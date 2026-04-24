import { z } from "zod";

export const syncSponsorSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().min(1).max(200).optional(),
  walletAddress: z.string().min(32).max(64).optional(),
});

export type SyncSponsorInput = z.infer<typeof syncSponsorSchema>;

import { PublicKey, TransactionInstruction } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const CAMPAIGN_ACCOUNT_SEED = "campaign";
export const MAX_CAMPAIGN_ID_LEN = 64;

async function hashCampaignId(campaignId: string): Promise<Uint8Array> {
  const data = new TextEncoder().encode(campaignId);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return new Uint8Array(digest);
}

export async function deriveCampaignPda(
  programId: PublicKey,
  campaignId: string,
): Promise<[PublicKey, number]> {
  const hash = await hashCampaignId(campaignId);
  return PublicKey.findProgramAddressSync(
    [new TextEncoder().encode(CAMPAIGN_ACCOUNT_SEED), hash],
    programId,
  );
}

export function encodeFinalizePrivateCampaignFundingInstruction(
  campaignId: string,
): Uint8Array {
  const idBytes = new TextEncoder().encode(campaignId);
  if (idBytes.length === 0 || idBytes.length > MAX_CAMPAIGN_ID_LEN) {
    throw new Error(`campaignId must be between 1 and ${MAX_CAMPAIGN_ID_LEN} bytes`);
  }

  const buffer = new Uint8Array(1 + 2 + idBytes.length);
  const view = new DataView(buffer.buffer);
  view.setUint8(0, 3);
  view.setUint16(1, idBytes.length, true);
  buffer.set(idBytes, 3);
  return buffer;
}

export function buildFinalizePrivateCampaignFundingIx(params: {
  programId: PublicKey;
  sponsor: PublicKey;
  payer: PublicKey;
  campaignPda: PublicKey;
  vaultUsdcAta: PublicKey;
  usdcMint: PublicKey;
  campaignId: string;
}): TransactionInstruction {
  return new TransactionInstruction({
    programId: params.programId,
    keys: [
      { pubkey: params.sponsor, isSigner: false, isWritable: false },
      { pubkey: params.payer, isSigner: true, isWritable: true },
      { pubkey: params.campaignPda, isSigner: false, isWritable: true },
      { pubkey: params.vaultUsdcAta, isSigner: false, isWritable: false },
      { pubkey: params.usdcMint, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.from(encodeFinalizePrivateCampaignFundingInstruction(params.campaignId)),
  });
}

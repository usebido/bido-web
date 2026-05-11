import { KoraClient } from "@solana/kora";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";

let cachedClient: KoraClient | null = null;

export function getKoraClient(): KoraClient {
  if (cachedClient) {
    return cachedClient;
  }

  const rpcUrl = process.env.NEXT_PUBLIC_KORA_RPC_URL;
  if (!rpcUrl) {
    throw new Error("NEXT_PUBLIC_KORA_RPC_URL is not configured");
  }

  cachedClient = new KoraClient({ rpcUrl });
  return cachedClient;
}

export async function getKoraSignerAddress(client = getKoraClient()): Promise<PublicKey> {
  const { signer_address } = await client.getPayerSigner();
  return new PublicKey(signer_address);
}

export async function sendKoraPaidTransaction(params: {
  connection: Connection;
  client?: KoraClient;
  feePayer: PublicKey;
  ephSigner: Keypair;
  feeMint: PublicKey;
  instructions: TransactionInstruction[];
}): Promise<{ signature: string }> {
  const client = params.client ?? getKoraClient();
  const { blockhash } = await params.connection.getLatestBlockhash("confirmed");

  const tx = new Transaction({
    feePayer: params.feePayer,
    recentBlockhash: blockhash,
  });
  tx.add(...params.instructions);

  const probeBase64 = tx
    .serialize({ verifySignatures: false, requireAllSignatures: false })
    .toString("base64");

  const estimate = await client.estimateTransactionFee({
    transaction: probeBase64,
    fee_token: params.feeMint.toBase58(),
    signer_key: params.feePayer.toBase58(),
    sig_verify: false,
  });

  const paymentAddress = new PublicKey(estimate.payment_address);
  const sourceAta = getAssociatedTokenAddressSync(params.feeMint, params.ephSigner.publicKey, false);
  const paymentAta = getAssociatedTokenAddressSync(params.feeMint, paymentAddress, false);

  tx.add(
    createAssociatedTokenAccountIdempotentInstruction(
      params.feePayer,
      paymentAta,
      paymentAddress,
      params.feeMint,
    ),
    createTransferInstruction(
      sourceAta,
      paymentAta,
      params.ephSigner.publicKey,
      estimate.fee_in_token,
    ),
  );

  tx.partialSign(params.ephSigner);

  const signedBase64 = tx
    .serialize({ verifySignatures: false, requireAllSignatures: false })
    .toString("base64");

  const { signature } = await client.signAndSendTransaction({
    transaction: signedBase64,
    signer_key: params.feePayer.toBase58(),
    sig_verify: false,
  });

  return { signature };
}

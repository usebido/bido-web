import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  getCloakRelayUrl,
  getCloakSdk,
  getDevnetMockUsdcMintAddress,
  getSolanaNetwork,
  isDevnetNetwork,
} from "@/lib/cloak-config";
import { buildFinalizePrivateCampaignFundingIx } from "@/lib/bido-program";
import {
  clearEph,
  generateEph,
  hasPersistedEph,
  persistEph,
  recoverEph,
} from "@/lib/eph-storage";
import {
  clearShieldedUtxos,
  getShieldedBalanceAtomic,
  loadShieldedUtxos,
  saveShieldedUtxos,
} from "@/lib/shielded-balance";
import {
  getKoraClient,
  getKoraSignerAddress,
  sendKoraPaidTransaction,
} from "@/lib/kora-client";
import type { CloakKeyPair } from "@cloak.dev/sdk";

const KEYS_STORAGE_PREFIX = "bido:cloak:keys:";
const REGISTRATION_STORAGE_PREFIX = "bido:cloak:registration:";

// Buffer in USDC atomic units (0.5 USDC) to cover Kora's USDC fee for the
// bundled funding tx. Dust remaining in the ephemeral ATA is acceptable in v1.
const KORA_FEE_BUFFER_ATOMIC = BigInt(500_000);

export type CloakWalletBindings = {
  address: string;
  publicKey: PublicKey;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
  signTransaction: <T extends Transaction | VersionedTransaction>(
    transaction: T,
  ) => Promise<T>;
};

export type PrivateCampaignFundingResult = {
  viewingKeyReference: string;
  shieldSignature: string;
  withdrawSignature: string;
  fundSignature: string;
  fundedAmountAtomic: string;
};

export type ResumePrivateCampaignFundingResult = {
  fundSignature: string;
  fundedAmountAtomic: string;
};

export function hasPendingPrivateCampaignFunding(
  sponsorAddress: string,
  campaignId: string,
): boolean {
  return hasPersistedEph(sponsorAddress, campaignId);
}

export type ShieldUsdcBalanceResult = {
  shieldSignature: string;
  shieldedAmountAtomic: string;
};

export function getPrivateShieldedBalanceAtomic(
  sponsorAddress: string,
  usdcMintAddress: string,
): bigint {
  return getShieldedBalanceAtomic(sponsorAddress, usdcMintAddress);
}

export function getRequiredShieldAtomic(budgetUsdc: number): bigint {
  return decimalUsdcToAtomic(budgetUsdc) + KORA_FEE_BUFFER_ATOMIC;
}

export function canUsePreShieldedBalance(
  sponsorAddress: string,
  usdcMintAddress: string,
  budgetUsdc: number,
): boolean {
  const balance = getShieldedBalanceAtomic(sponsorAddress, usdcMintAddress);
  return balance >= getRequiredShieldAtomic(budgetUsdc);
}

function walletStorageKey(walletAddress: string) {
  return `${KEYS_STORAGE_PREFIX}${walletAddress}`;
}

function registrationStorageKey(walletAddress: string) {
  return `${REGISTRATION_STORAGE_PREFIX}${walletAddress}`;
}

function decimalUsdcToAtomic(amount: number | string): bigint {
  const normalized = typeof amount === "number" ? amount.toFixed(2) : amount.trim();
  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    throw new Error(`Invalid decimal USDC amount: ${amount}`);
  }

  const [wholePart, fractionalPart = ""] = normalized.split(".");
  const paddedFraction = `${fractionalPart}000000`.slice(0, 6);
  return BigInt(wholePart) * BigInt(1_000_000) + BigInt(paddedFraction);
}

function emitProofProgress(
  onProgress: ((status: string) => void) | undefined,
  phase: "deposit" | "withdraw",
  percent: number,
) {
  const rounded = Math.max(0, Math.min(100, Math.round(percent)));
  onProgress?.(
    phase === "deposit"
      ? `Generating Cloak deposit proof (${rounded}%)...`
      : `Generating Cloak withdraw proof (${rounded}%)...`,
  );
}

function loadKeys(walletAddress: string): CloakKeyPair | null {
  const cloakSdk = getCloakSdk();
  const raw = window.localStorage.getItem(walletStorageKey(walletAddress));
  if (!raw) {
    return null;
  }

  try {
    return cloakSdk.importKeys(raw);
  } catch {
    window.localStorage.removeItem(walletStorageKey(walletAddress));
    return null;
  }
}

function saveKeys(walletAddress: string, keys: CloakKeyPair) {
  const cloakSdk = getCloakSdk();
  window.localStorage.setItem(walletStorageKey(walletAddress), cloakSdk.exportKeys(keys));
}

async function getOrCreateKeys(walletAddress: string): Promise<CloakKeyPair> {
  const cloakSdk = getCloakSdk();
  const existing = loadKeys(walletAddress);
  if (existing) {
    return existing;
  }

  const next = cloakSdk.generateCloakKeys();
  saveKeys(walletAddress, next);
  return next;
}

async function ensureViewingKeyRegistered(
  relayUrl: string,
  wallet: CloakWalletBindings,
  nk: Uint8Array,
): Promise<void> {
  const cloakSdk = getCloakSdk();
  const cacheKey = registrationStorageKey(wallet.address);
  const alreadyRegistered = window.localStorage.getItem(cacheKey);
  if (alreadyRegistered === "1") {
    return;
  }

  await cloakSdk.registerViewingKey(relayUrl, wallet.publicKey, nk, wallet.signMessage);
  window.localStorage.setItem(cacheKey, "1");
}

async function ensureShieldPoolReady(connection: Connection, mint: PublicKey): Promise<void> {
  const cloakSdk = getCloakSdk();
  const { merkleTree } = cloakSdk.getShieldPoolPDAs(cloakSdk.CLOAK_PROGRAM_ID, mint);
  const accountInfo = await connection.getAccountInfo(merkleTree, "confirmed");

  if (accountInfo) {
    return;
  }

  throw new Error(
    `Cloak private funding is unavailable for mint ${mint.toBase58()} on ${connection.rpcEndpoint} because the shield pool Merkle tree ${merkleTree.toBase58()} is not initialized on this cluster.`,
  );
}

export async function shieldUsdcBalance(params: {
  amountUsdc: number;
  usdcMintAddress: string;
  connection: Connection;
  wallet: CloakWalletBindings;
  onProgress?: (status: string) => void;
}): Promise<ShieldUsdcBalanceResult> {
  const network = getSolanaNetwork();
  const cloakSdk = getCloakSdk(network);
  const relayUrl = getCloakRelayUrl(network);
  const usdcMint = new PublicKey(params.usdcMintAddress);
  const amountAtomic = decimalUsdcToAtomic(params.amountUsdc);

  if (isDevnetNetwork(network) && params.usdcMintAddress !== getDevnetMockUsdcMintAddress()) {
    throw new Error(
      `Cloak devnet shielding requires the mock USDC mint ${getDevnetMockUsdcMintAddress()}. The current mint is ${params.usdcMintAddress}.`,
    );
  }

  await ensureShieldPoolReady(params.connection, usdcMint);

  const keys = await getOrCreateKeys(params.wallet.address);
  const owner = await cloakSdk.deriveUtxoKeypairFromSpendKey(keys.spend.sk_spend);
  const nk = cloakSdk.getNkFromUtxoPrivateKey(owner.privateKey);

  params.onProgress?.("Registering Cloak viewing key...");
  await ensureViewingKeyRegistered(relayUrl, params.wallet, nk);

  params.onProgress?.("Shielding USDC in Cloak...");
  const output = await cloakSdk.createUtxo(amountAtomic, owner, usdcMint);
  const depositResult = await cloakSdk.transact(
    {
      inputUtxos: [
        await cloakSdk.createZeroUtxo(usdcMint),
        await cloakSdk.createZeroUtxo(usdcMint),
      ],
      outputUtxos: [output, await cloakSdk.createZeroUtxo(usdcMint)],
      externalAmount: amountAtomic,
      depositor: params.wallet.publicKey,
    },
    {
      connection: params.connection,
      programId: cloakSdk.CLOAK_PROGRAM_ID,
      relayUrl,
      signTransaction: params.wallet.signTransaction,
      signMessage: params.wallet.signMessage,
      depositorPublicKey: params.wallet.publicKey,
      walletPublicKey: params.wallet.publicKey,
      chainNoteViewingKeyNk: nk,
      enforceViewingKeyRegistration: true,
      onProgress: params.onProgress,
      onProofProgress: (percent: number) => emitProofProgress(params.onProgress, "deposit", percent),
    },
  );

  const newUtxos = depositResult.outputUtxos.filter((utxo) => utxo.amount > BigInt(0));
  const existing = loadShieldedUtxos(params.wallet.address, params.usdcMintAddress);
  saveShieldedUtxos(params.wallet.address, params.usdcMintAddress, [...existing, ...newUtxos]);

  return {
    shieldSignature: depositResult.signature,
    shieldedAmountAtomic: amountAtomic.toString(),
  };
}

export async function runPrivateCampaignFunding(params: {
  campaignId: string;
  budgetUsdc: number;
  usdcMintAddress: string;
  vaultUsdcAta: string;
  campaignPda: string;
  programId: string;
  connection: Connection;
  wallet: CloakWalletBindings;
  usePreShielded?: boolean;
  onProgress?: (status: string) => void;
}): Promise<PrivateCampaignFundingResult> {
  const network = getSolanaNetwork();
  const cloakSdk = getCloakSdk(network);
  const relayUrl = getCloakRelayUrl(network);
  const usdcMint = new PublicKey(params.usdcMintAddress);
  const vaultUsdcAta = new PublicKey(params.vaultUsdcAta);
  const campaignPda = new PublicKey(params.campaignPda);
  const bidoProgramId = new PublicKey(params.programId);
  const budgetAtomic = decimalUsdcToAtomic(params.budgetUsdc);
  const shieldAtomic = budgetAtomic + KORA_FEE_BUFFER_ATOMIC;

  if (isDevnetNetwork(network) && params.usdcMintAddress !== getDevnetMockUsdcMintAddress()) {
    throw new Error(
      `Cloak devnet private funding requires the mock USDC mint ${getDevnetMockUsdcMintAddress()}. The current mint is ${params.usdcMintAddress}.`,
    );
  }

  await ensureShieldPoolReady(params.connection, usdcMint);

  const keys = await getOrCreateKeys(params.wallet.address);
  const owner = await cloakSdk.deriveUtxoKeypairFromSpendKey(keys.spend.sk_spend);
  const nk = cloakSdk.getNkFromUtxoPrivateKey(owner.privateKey);

  params.onProgress?.("Registering Cloak viewing key...");
  await ensureViewingKeyRegistered(relayUrl, params.wallet, nk);

  const sharedOpts = {
    connection: params.connection,
    programId: cloakSdk.CLOAK_PROGRAM_ID,
    relayUrl,
    signTransaction: params.wallet.signTransaction,
    signMessage: params.wallet.signMessage,
    depositorPublicKey: params.wallet.publicKey,
    walletPublicKey: params.wallet.publicKey,
    chainNoteViewingKeyNk: nk,
    enforceViewingKeyRegistration: true,
    onProgress: params.onProgress,
  };

  let shieldedUtxos: Awaited<ReturnType<typeof cloakSdk.transact>>["outputUtxos"];
  let cachedMerkleTree: Awaited<ReturnType<typeof cloakSdk.transact>>["merkleTree"] | undefined;
  let shieldSignature: string;

  if (params.usePreShielded) {
    const stored = loadShieldedUtxos(params.wallet.address, params.usdcMintAddress);
    const storedSum = stored.reduce((s, u) => s + u.amount, BigInt(0));
    if (storedSum < shieldAtomic) {
      throw new Error(
        `Insufficient pre-shielded balance: have ${storedSum} atomic USDC, need ${shieldAtomic}. Add to your private balance first.`,
      );
    }
    shieldedUtxos = stored;
    shieldSignature = "preshielded";
    params.onProgress?.("Using pre-shielded balance...");
  } else {
    // Tx 2 — shield budget + fee buffer
    params.onProgress?.("Shielding USDC in Cloak...");
    const shieldedOutput = await cloakSdk.createUtxo(shieldAtomic, owner, usdcMint);
    const depositResult = await cloakSdk.transact(
      {
        inputUtxos: [
          await cloakSdk.createZeroUtxo(usdcMint),
          await cloakSdk.createZeroUtxo(usdcMint),
        ],
        outputUtxos: [shieldedOutput, await cloakSdk.createZeroUtxo(usdcMint)],
        externalAmount: shieldAtomic,
        depositor: params.wallet.publicKey,
      },
      {
        ...sharedOpts,
        onProofProgress: (percent: number) => emitProofProgress(params.onProgress, "deposit", percent),
      },
    );

    shieldedUtxos = depositResult.outputUtxos.filter((utxo) => utxo.amount > BigInt(0));
    cachedMerkleTree = depositResult.merkleTree;
    shieldSignature = depositResult.signature;
  }

  // Recover existing eph if present (interrupted prior run), otherwise generate fresh
  let eph = await recoverEph({
    sponsorAddress: params.wallet.address,
    campaignId: params.campaignId,
    signMessage: params.wallet.signMessage,
  });
  if (!eph) {
    eph = generateEph();
    await persistEph({
      eph,
      sponsorAddress: params.wallet.address,
      campaignId: params.campaignId,
      signMessage: params.wallet.signMessage,
    });
  }

  // Tx 3 — unshield exactly shieldAtomic to ephemeral wallet (partialWithdraw handles change)
  params.onProgress?.("Unshielding into ephemeral wallet...");
  let withdrawResult: Awaited<ReturnType<typeof cloakSdk.partialWithdraw>> | undefined;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      withdrawResult = await cloakSdk.partialWithdraw(
        shieldedUtxos,
        eph.publicKey,
        shieldAtomic,
        {
          ...sharedOpts,
          cachedMerkleTree,
          onProofProgress: (percent: number) => emitProofProgress(params.onProgress, "withdraw", percent),
        },
      );
      break;
    } catch (error) {
      if (!cloakSdk.isRootNotFoundError(error) || attempt === 3) {
        throw error;
      }
      params.onProgress?.("Cloak root stale, retrying withdraw...");
      await new Promise((resolve) => window.setTimeout(resolve, 1_500));
    }
  }

  if (!withdrawResult) {
    throw new Error("Cloak withdraw did not produce a result");
  }

  if (params.usePreShielded) {
    const changeUtxos = withdrawResult.outputUtxos.filter((utxo) => utxo.amount > BigInt(0));
    if (changeUtxos.length > 0) {
      saveShieldedUtxos(params.wallet.address, params.usdcMintAddress, changeUtxos);
    } else {
      clearShieldedUtxos(params.wallet.address, params.usdcMintAddress);
    }
  }

  // Tx 4 — Kora-paid bundle: transfer eph_ata -> vault_ata + finalize
  params.onProgress?.("Funding campaign vault via Kora...");
  const koraClient = getKoraClient();
  const feePayer = await getKoraSignerAddress(koraClient);
  const ephUsdcAta = getAssociatedTokenAddressSync(usdcMint, eph.publicKey, false);

  const transferIx = createTransferInstruction(
    ephUsdcAta,
    vaultUsdcAta,
    eph.publicKey,
    budgetAtomic,
  );
  const finalizeIx = buildFinalizePrivateCampaignFundingIx({
    programId: bidoProgramId,
    sponsor: params.wallet.publicKey,
    payer: feePayer,
    campaignPda,
    vaultUsdcAta,
    usdcMint,
    campaignId: params.campaignId,
  });

  const { signature: fundSignature } = await sendKoraPaidTransaction({
    connection: params.connection,
    client: koraClient,
    feePayer,
    ephSigner: eph,
    feeMint: usdcMint,
    instructions: [transferIx, finalizeIx],
  });

  clearEph(params.wallet.address, params.campaignId);

  return {
    viewingKeyReference: keys.view.pvk_hex,
    shieldSignature,
    withdrawSignature: withdrawResult.signature,
    fundSignature,
    fundedAmountAtomic: budgetAtomic.toString(),
  };
}

export async function runResumePrivateCampaignFunding(params: {
  campaignId: string;
  usdcMintAddress: string;
  vaultUsdcAta: string;
  campaignPda: string;
  programId: string;
  connection: Connection;
  wallet: CloakWalletBindings;
  onProgress?: (status: string) => void;
}): Promise<ResumePrivateCampaignFundingResult> {
  const usdcMint = new PublicKey(params.usdcMintAddress);
  const vaultUsdcAta = new PublicKey(params.vaultUsdcAta);
  const campaignPda = new PublicKey(params.campaignPda);
  const bidoProgramId = new PublicKey(params.programId);

  params.onProgress?.("Recovering ephemeral wallet...");
  const eph = await recoverEph({
    sponsorAddress: params.wallet.address,
    campaignId: params.campaignId,
    signMessage: params.wallet.signMessage,
  });
  if (!eph) {
    throw new Error("No pending private funding found for this campaign");
  }

  const ephUsdcAta = getAssociatedTokenAddressSync(usdcMint, eph.publicKey, false);
  let ephBalance: bigint;
  try {
    const tokenAccount = await params.connection.getTokenAccountBalance(ephUsdcAta, "confirmed");
    ephBalance = BigInt(tokenAccount.value.amount);
  } catch {
    clearEph(params.wallet.address, params.campaignId);
    throw new Error("Ephemeral wallet has no funds to recover. State cleared.");
  }

  if (ephBalance <= KORA_FEE_BUFFER_ATOMIC) {
    clearEph(params.wallet.address, params.campaignId);
    throw new Error(
      `Ephemeral wallet balance (${ephBalance}) is too low to cover Kora fees. State cleared.`,
    );
  }

  const transferAmount = ephBalance - KORA_FEE_BUFFER_ATOMIC;

  params.onProgress?.("Funding campaign vault via Kora...");
  const koraClient = getKoraClient();
  const feePayer = await getKoraSignerAddress(koraClient);

  const transferIx = createTransferInstruction(
    ephUsdcAta,
    vaultUsdcAta,
    eph.publicKey,
    transferAmount,
  );
  const finalizeIx = buildFinalizePrivateCampaignFundingIx({
    programId: bidoProgramId,
    sponsor: params.wallet.publicKey,
    payer: feePayer,
    campaignPda,
    vaultUsdcAta,
    usdcMint,
    campaignId: params.campaignId,
  });

  const { signature: fundSignature } = await sendKoraPaidTransaction({
    connection: params.connection,
    client: koraClient,
    feePayer,
    ephSigner: eph,
    feeMint: usdcMint,
    instructions: [transferIx, finalizeIx],
  });

  clearEph(params.wallet.address, params.campaignId);

  return {
    fundSignature,
    fundedAmountAtomic: transferAmount.toString(),
  };
}

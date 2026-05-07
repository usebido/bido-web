import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";
import {
  type CloakSdkModule,
  getCloakRelayUrl,
  getCloakSdk,
  getDevnetMockUsdcMintAddress,
  getSolanaNetwork,
  isDevnetNetwork,
} from "@/lib/cloak-config";
import type { CloakKeyPair, Utxo } from "@cloak.dev/sdk";

const KEYS_STORAGE_PREFIX = "bido:cloak:keys:";
const REGISTRATION_STORAGE_PREFIX = "bido:cloak:registration:";
const CAMPAIGN_UTXO_STORAGE_PREFIX = "bido:cloak:campaign-utxos:";

type StoredUtxo = {
  amount: string;
  privateKey: string;
  publicKey: string;
  blinding: string;
  mintAddress: string;
  index?: number;
  commitment?: string;
  nullifier?: string;
  siblingCommitment?: string;
};

type StoredCampaignUtxos = {
  utxos: StoredUtxo[];
  depositSignature: string | null;
  updatedAt: string;
};

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
  depositSignature: string | null;
  withdrawSignature: string;
  withdrawAmountAtomic: string;
};

function walletStorageKey(walletAddress: string) {
  return `${KEYS_STORAGE_PREFIX}${walletAddress}`;
}

function registrationStorageKey(walletAddress: string) {
  return `${REGISTRATION_STORAGE_PREFIX}${walletAddress}`;
}

function campaignUtxoStorageKey(campaignId: string) {
  return `${CAMPAIGN_UTXO_STORAGE_PREFIX}${campaignId}`;
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

function serializeUtxo(utxo: Utxo): StoredUtxo {
  return {
    amount: utxo.amount.toString(),
    privateKey: utxo.keypair.privateKey.toString(),
    publicKey: utxo.keypair.publicKey.toString(),
    blinding: utxo.blinding.toString(),
    mintAddress: utxo.mintAddress.toBase58(),
    index: utxo.index,
    commitment: utxo.commitment?.toString(),
    nullifier: utxo.nullifier?.toString(),
    siblingCommitment: utxo.siblingCommitment?.toString(),
  };
}

function deserializeUtxo(value: StoredUtxo): Utxo {
  return {
    amount: BigInt(value.amount),
    keypair: {
      privateKey: BigInt(value.privateKey),
      publicKey: BigInt(value.publicKey),
    },
    blinding: BigInt(value.blinding),
    mintAddress: new PublicKey(value.mintAddress),
    index: value.index,
    commitment: value.commitment ? BigInt(value.commitment) : undefined,
    nullifier: value.nullifier ? BigInt(value.nullifier) : undefined,
    siblingCommitment: value.siblingCommitment
      ? BigInt(value.siblingCommitment)
      : undefined,
  };
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

function loadCampaignUtxoState(campaignId: string): {
  utxos: Utxo[];
  depositSignature: string | null;
} {
  const raw = window.localStorage.getItem(campaignUtxoStorageKey(campaignId));
  if (!raw) {
    return { utxos: [], depositSignature: null };
  }

  try {
    const parsed = JSON.parse(raw) as StoredCampaignUtxos;
    return {
      utxos: parsed.utxos.map(deserializeUtxo),
      depositSignature: parsed.depositSignature ?? null,
    };
  } catch {
    window.localStorage.removeItem(campaignUtxoStorageKey(campaignId));
    return { utxos: [], depositSignature: null };
  }
}

function saveCampaignUtxos(
  campaignId: string,
  utxos: Utxo[],
  depositSignature: string | null,
) {
  const payload: StoredCampaignUtxos = {
    utxos: utxos.map(serializeUtxo),
    depositSignature,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(campaignUtxoStorageKey(campaignId), JSON.stringify(payload));
}

function clearCampaignUtxos(campaignId: string) {
  window.localStorage.removeItem(campaignUtxoStorageKey(campaignId));
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

async function getVaultAmountAtomic(connection: Connection, vaultAddress: PublicKey): Promise<bigint> {
  const balance = await connection.getTokenAccountBalance(vaultAddress, "confirmed");
  return BigInt(balance.value.amount);
}

async function waitForVaultDelta(
  connection: Connection,
  vaultAddress: PublicKey,
  previousAmount: bigint,
): Promise<bigint> {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    const nextAmount = await getVaultAmountAtomic(connection, vaultAddress);
    if (nextAmount > previousAmount) {
      return nextAmount - previousAmount;
    }
    await new Promise((resolve) => window.setTimeout(resolve, 1_000));
  }

  throw new Error("Cloak withdraw was submitted, but the campaign vault balance did not increase in time");
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

export async function runPrivateCampaignFunding(params: {
  campaignId: string;
  budgetUsdc: number;
  usdcMintAddress: string;
  vaultUsdcAta: string;
  connection: Connection;
  wallet: CloakWalletBindings;
  onProgress?: (status: string) => void;
}): Promise<PrivateCampaignFundingResult> {
  const network = getSolanaNetwork();
  const cloakSdk = getCloakSdk(network);
  const relayUrl = getCloakRelayUrl(network);
  const usdcMint = new PublicKey(params.usdcMintAddress);
  const vaultUsdcAta = new PublicKey(params.vaultUsdcAta);
  const budgetAtomic = decimalUsdcToAtomic(params.budgetUsdc);

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

  const storedState = loadCampaignUtxoState(params.campaignId);
  let inputUtxos = storedState.utxos;
  let depositSignature: string | null = storedState.depositSignature;
  let cachedMerkleTree: Awaited<ReturnType<CloakSdkModule["transact"]>>["merkleTree"] | undefined;

  if (inputUtxos.length === 0) {
    params.onProgress?.("Shielding USDC in Cloak...");
    const output = await cloakSdk.createUtxo(budgetAtomic, owner, usdcMint);
    const result = await cloakSdk.transact(
      {
        inputUtxos: [
          await cloakSdk.createZeroUtxo(usdcMint),
          await cloakSdk.createZeroUtxo(usdcMint),
        ],
        outputUtxos: [output, await cloakSdk.createZeroUtxo(usdcMint)],
        externalAmount: budgetAtomic,
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
        onProofProgress: (percent) => emitProofProgress(params.onProgress, "deposit", percent),
      },
    );

    inputUtxos = result.outputUtxos.filter((utxo) => utxo.amount > BigInt(0));
    depositSignature = result.signature;
    cachedMerkleTree = result.merkleTree;
    saveCampaignUtxos(params.campaignId, inputUtxos, depositSignature);
  }

  const vaultBefore = await getVaultAmountAtomic(params.connection, vaultUsdcAta);

  params.onProgress?.("Withdrawing privately into the campaign vault...");
  let withdrawResult: Awaited<ReturnType<typeof cloakSdk.fullWithdraw>> | undefined;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      withdrawResult = await cloakSdk.fullWithdraw(inputUtxos, vaultUsdcAta, {
        connection: params.connection,
        programId: cloakSdk.CLOAK_PROGRAM_ID,
        relayUrl,
        signTransaction: params.wallet.signTransaction,
        signMessage: params.wallet.signMessage,
        depositorPublicKey: params.wallet.publicKey,
        walletPublicKey: params.wallet.publicKey,
        chainNoteViewingKeyNk: nk,
        enforceViewingKeyRegistration: true,
        cachedMerkleTree,
        onProgress: params.onProgress,
        onProofProgress: (percent) => emitProofProgress(params.onProgress, "withdraw", percent),
      });
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

  const withdrawAmountAtomic = await waitForVaultDelta(
    params.connection,
    vaultUsdcAta,
    vaultBefore,
  );

  clearCampaignUtxos(params.campaignId);

  return {
    viewingKeyReference: keys.view.pvk_hex,
    depositSignature,
    withdrawSignature: withdrawResult.signature,
    withdrawAmountAtomic: withdrawAmountAtomic.toString(),
  };
}

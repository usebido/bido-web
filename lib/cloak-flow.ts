import {
  CLOAK_PROGRAM_ID,
  createUtxo,
  createZeroUtxo,
  deriveUtxoKeypairFromSpendKey,
  exportKeys,
  fullWithdraw,
  generateCloakKeys,
  getNkFromUtxoPrivateKey,
  importKeys,
  registerViewingKey,
  transact,
  type CloakKeyPair,
  type Utxo,
} from "@cloak.dev/sdk";
import {
  Connection,
  PublicKey,
  Transaction,
  VersionedTransaction,
} from "@solana/web3.js";

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
  const raw = window.localStorage.getItem(walletStorageKey(walletAddress));
  if (!raw) {
    return null;
  }

  try {
    return importKeys(raw);
  } catch {
    window.localStorage.removeItem(walletStorageKey(walletAddress));
    return null;
  }
}

function saveKeys(walletAddress: string, keys: CloakKeyPair) {
  window.localStorage.setItem(walletStorageKey(walletAddress), exportKeys(keys));
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

async function getOrCreateKeys(walletAddress: string): Promise<CloakKeyPair> {
  const existing = loadKeys(walletAddress);
  if (existing) {
    return existing;
  }

  const next = generateCloakKeys();
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
  const cacheKey = registrationStorageKey(wallet.address);
  const alreadyRegistered = window.localStorage.getItem(cacheKey);
  if (alreadyRegistered === "1") {
    return;
  }

  await registerViewingKey(relayUrl, wallet.publicKey, nk, wallet.signMessage);
  window.localStorage.setItem(cacheKey, "1");
}

export async function runPrivateCampaignFunding(params: {
  campaignId: string;
  budgetUsdc: number;
  usdcMintAddress: string;
  vaultUsdcAta: string;
  connection: Connection;
  wallet: CloakWalletBindings;
  relayUrl?: string;
  onProgress?: (status: string) => void;
}): Promise<PrivateCampaignFundingResult> {
  const relayUrl = params.relayUrl ?? "https://api.cloak.ag";
  const usdcMint = new PublicKey(params.usdcMintAddress);
  const vaultUsdcAta = new PublicKey(params.vaultUsdcAta);
  const budgetAtomic = decimalUsdcToAtomic(params.budgetUsdc);

  const keys = await getOrCreateKeys(params.wallet.address);
  const owner = await deriveUtxoKeypairFromSpendKey(keys.spend.sk_spend);
  const nk = getNkFromUtxoPrivateKey(owner.privateKey);

  params.onProgress?.("Registering Cloak viewing key...");
  await ensureViewingKeyRegistered(relayUrl, params.wallet, nk);

  const storedState = loadCampaignUtxoState(params.campaignId);
  let inputUtxos = storedState.utxos;
  let depositSignature: string | null = storedState.depositSignature;
  let cachedMerkleTree: Awaited<ReturnType<typeof transact>>["merkleTree"] | undefined;

  if (inputUtxos.length === 0) {
    params.onProgress?.("Shielding USDC in Cloak...");
    const output = await createUtxo(budgetAtomic, owner, usdcMint);
    const result = await transact(
      {
        inputUtxos: [await createZeroUtxo(usdcMint), await createZeroUtxo(usdcMint)],
        outputUtxos: [output, await createZeroUtxo(usdcMint)],
        externalAmount: budgetAtomic,
        depositor: params.wallet.publicKey,
      },
      {
        connection: params.connection,
        programId: CLOAK_PROGRAM_ID,
        relayUrl,
        signTransaction: params.wallet.signTransaction,
        signMessage: params.wallet.signMessage,
        depositorPublicKey: params.wallet.publicKey,
        walletPublicKey: params.wallet.publicKey,
        chainNoteViewingKeyNk: nk,
        enforceViewingKeyRegistration: true,
        onProgress: params.onProgress,
      },
    );

    inputUtxos = result.outputUtxos.filter((utxo) => utxo.amount > BigInt(0));
    depositSignature = result.signature;
    cachedMerkleTree = result.merkleTree;
    saveCampaignUtxos(params.campaignId, inputUtxos, depositSignature);
  }

  const vaultBefore = await getVaultAmountAtomic(params.connection, vaultUsdcAta);

  params.onProgress?.("Withdrawing privately into the campaign vault...");
  const withdrawResult = await fullWithdraw(inputUtxos, vaultUsdcAta, {
    connection: params.connection,
    programId: CLOAK_PROGRAM_ID,
    relayUrl,
    signTransaction: params.wallet.signTransaction,
    signMessage: params.wallet.signMessage,
    depositorPublicKey: params.wallet.publicKey,
    walletPublicKey: params.wallet.publicKey,
    chainNoteViewingKeyNk: nk,
    enforceViewingKeyRegistration: true,
    cachedMerkleTree,
    onProgress: params.onProgress,
  });

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

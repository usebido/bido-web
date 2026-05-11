import { PublicKey } from "@solana/web3.js";
import type { Utxo } from "@cloak.dev/sdk";

const SHIELDED_BALANCE_PREFIX = "bido:cloak:shielded-balance:";

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

type StoredShieldedBalance = {
  mintAddress: string;
  utxos: StoredUtxo[];
  updatedAt: string;
};

function storageKey(sponsorAddress: string, mintAddress: string) {
  return `${SHIELDED_BALANCE_PREFIX}${sponsorAddress}:${mintAddress}`;
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
    siblingCommitment: value.siblingCommitment ? BigInt(value.siblingCommitment) : undefined,
  };
}

export function saveShieldedUtxos(
  sponsorAddress: string,
  mintAddress: string,
  utxos: Utxo[],
): void {
  const payload: StoredShieldedBalance = {
    mintAddress,
    utxos: utxos.map(serializeUtxo),
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(storageKey(sponsorAddress, mintAddress), JSON.stringify(payload));
}

export function loadShieldedUtxos(sponsorAddress: string, mintAddress: string): Utxo[] {
  const raw = window.localStorage.getItem(storageKey(sponsorAddress, mintAddress));
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as StoredShieldedBalance;
    return parsed.utxos.map(deserializeUtxo);
  } catch {
    window.localStorage.removeItem(storageKey(sponsorAddress, mintAddress));
    return [];
  }
}

export function clearShieldedUtxos(sponsorAddress: string, mintAddress: string): void {
  window.localStorage.removeItem(storageKey(sponsorAddress, mintAddress));
}

export function getShieldedBalanceAtomic(sponsorAddress: string, mintAddress: string): bigint {
  const utxos = loadShieldedUtxos(sponsorAddress, mintAddress);
  return utxos.reduce((sum, utxo) => sum + utxo.amount, BigInt(0));
}

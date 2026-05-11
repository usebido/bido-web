import { Keypair } from "@solana/web3.js";

const EPH_STORAGE_PREFIX = "bido:eph:";

type StoredEph = {
  iv: string;
  ciphertext: string;
  createdAt: string;
};

function storageKey(sponsorAddress: string, campaignId: string) {
  return `${EPH_STORAGE_PREFIX}${sponsorAddress}:${campaignId}`;
}

function recoveryMessage(campaignId: string): Uint8Array {
  return new TextEncoder().encode(`bido-eph-recovery:${campaignId}`);
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

function fromHex(hex: string): Uint8Array {
  if (hex.length % 2 !== 0) {
    throw new Error("Invalid hex length");
  }
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i += 1) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function deriveAesKey(
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
  campaignId: string,
): Promise<CryptoKey> {
  const signature = await signMessage(recoveryMessage(campaignId));
  const keyMaterial = await crypto.subtle.digest("SHA-256", signature);
  return crypto.subtle.importKey(
    "raw",
    keyMaterial,
    { name: "AES-GCM" },
    false,
    ["encrypt", "decrypt"],
  );
}

export function generateEph(): Keypair {
  return Keypair.generate();
}

export async function persistEph(params: {
  eph: Keypair;
  sponsorAddress: string;
  campaignId: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<void> {
  const aesKey = await deriveAesKey(params.signMessage, params.campaignId);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: "AES-GCM", iv }, aesKey, params.eph.secretKey),
  );
  const payload: StoredEph = {
    iv: toHex(iv),
    ciphertext: toHex(ciphertext),
    createdAt: new Date().toISOString(),
  };
  window.localStorage.setItem(
    storageKey(params.sponsorAddress, params.campaignId),
    JSON.stringify(payload),
  );
}

export async function recoverEph(params: {
  sponsorAddress: string;
  campaignId: string;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}): Promise<Keypair | null> {
  const raw = window.localStorage.getItem(storageKey(params.sponsorAddress, params.campaignId));
  if (!raw) {
    return null;
  }

  let payload: StoredEph;
  try {
    payload = JSON.parse(raw) as StoredEph;
  } catch {
    window.localStorage.removeItem(storageKey(params.sponsorAddress, params.campaignId));
    return null;
  }

  try {
    const aesKey = await deriveAesKey(params.signMessage, params.campaignId);
    const decrypted = new Uint8Array(
      await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromHex(payload.iv) },
        aesKey,
        fromHex(payload.ciphertext),
      ),
    );
    return Keypair.fromSecretKey(decrypted);
  } catch {
    return null;
  }
}

export function clearEph(sponsorAddress: string, campaignId: string): void {
  window.localStorage.removeItem(storageKey(sponsorAddress, campaignId));
}

export function hasPersistedEph(sponsorAddress: string, campaignId: string): boolean {
  return window.localStorage.getItem(storageKey(sponsorAddress, campaignId)) !== null;
}

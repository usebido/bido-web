"use client";

import { Buffer as NpmBuffer } from "buffer";

type BufferLike = {
  buffer: ArrayBufferLike;
  byteOffset: number;
  byteLength: number;
  readBigInt64LE?: (offset?: number) => bigint;
  readBigUInt64LE?: (offset?: number) => bigint;
  writeBigInt64LE?: (value: bigint, offset?: number) => number;
  writeBigUInt64LE?: (value: bigint, offset?: number) => number;
};

function readBigInt64LE(this: BufferLike, offset = 0): bigint {
  const view = new DataView(this.buffer, this.byteOffset, this.byteLength);
  return view.getBigInt64(offset, true);
}

function readBigUInt64LE(this: BufferLike, offset = 0): bigint {
  const view = new DataView(this.buffer, this.byteOffset, this.byteLength);
  return view.getBigUint64(offset, true);
}

function writeBigInt64LE(this: BufferLike, value: bigint, offset = 0): number {
  const view = new DataView(this.buffer, this.byteOffset, this.byteLength);
  view.setBigInt64(offset, value, true);
  return offset + 8;
}

function writeBigUInt64LE(this: BufferLike, value: bigint, offset = 0): number {
  const view = new DataView(this.buffer, this.byteOffset, this.byteLength);
  view.setBigUint64(offset, value, true);
  return offset + 8;
}

function patchPrototype(prototype: BufferLike | null | undefined) {
  if (!prototype) return;
  if (typeof prototype.readBigInt64LE !== "function") {
    prototype.readBigInt64LE = readBigInt64LE;
  }
  if (typeof prototype.readBigUInt64LE !== "function") {
    prototype.readBigUInt64LE = readBigUInt64LE;
  }
  if (typeof prototype.writeBigInt64LE !== "function") {
    prototype.writeBigInt64LE = writeBigInt64LE;
  }
  if (typeof prototype.writeBigUInt64LE !== "function") {
    prototype.writeBigUInt64LE = writeBigUInt64LE;
  }
}

type BufferConstructor = typeof NpmBuffer;
type GlobalWithBuffer = typeof globalThis & { Buffer?: BufferConstructor };

if (typeof globalThis !== "undefined") {
  const globalScope = globalThis as GlobalWithBuffer;

  // Defensive: patch Uint8Array.prototype so that ANY Buffer-derived class
  // (which all extend Uint8Array via setPrototypeOf) inherits these methods
  // via the prototype chain — even when the bundler injects an alternate
  // Buffer implementation (e.g. Next's compiled buffer v5) that we cannot
  // reach by name.
  patchPrototype(Uint8Array.prototype as unknown as BufferLike);

  const existing = globalScope.Buffer;
  const existingProto = existing?.prototype as BufferLike | undefined;
  const existingHasBigInt = typeof existingProto?.readBigInt64LE === "function";

  if (!existing || !existingHasBigInt) {
    globalScope.Buffer = NpmBuffer;
  }

  patchPrototype(NpmBuffer.prototype as unknown as BufferLike);
  patchPrototype(globalScope.Buffer?.prototype as unknown as BufferLike);

  try {
    const ActiveBuffer = globalScope.Buffer ?? NpmBuffer;
    const sample = ActiveBuffer.from(new Uint8Array(8));
    patchPrototype(Object.getPrototypeOf(sample) as BufferLike);
  } catch {
    // ignore — best-effort defensive patching
  }
}

export {};

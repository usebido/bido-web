declare module "bs58" {
  interface Bs58 {
    encode(input: Uint8Array): string;
    decode(input: string): Uint8Array;
  }

  const bs58: Bs58;
  export default bs58;
}

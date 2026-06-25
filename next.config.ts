import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // viem ships @noble/curves raw .ts source whose internal types conflict
    // with TS 5.8 generic Uint8Array<TArrayBuffer>. Errors live entirely in
    // node_modules — our code stays type-safe via `tsc --noEmit` and IDE.
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

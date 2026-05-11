import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";
import type { NextConfig } from "next";

const require = createRequire(import.meta.url);
const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const bufferPackageDir = path.dirname(require.resolve("buffer/package.json"));
const bufferRelativePath = `./${path.relative(projectRoot, bufferPackageDir).split(path.sep).join("/")}`;

const nextConfig: NextConfig = {
  typescript: {
    // viem ships @noble/curves raw .ts source whose internal types conflict
    // with TS 5.8 generic Uint8Array<TArrayBuffer>. Errors live entirely in
    // node_modules — our code stays type-safe via `tsc --noEmit` and IDE.
    ignoreBuildErrors: true,
  },
  // Force `buffer` to resolve to the npm `buffer@6+` package (which has
  // `readBigInt64LE` / `readBigUInt64LE`), instead of Next's bundled v5 polyfill.
  // Required by @cloak.dev/sdk which calls these BigInt methods in the browser.
  turbopack: {
    resolveAlias: {
      buffer: bufferRelativePath,
    },
  },
  webpack: (config) => {
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      buffer: bufferPackageDir,
    };
    return config;
  },
};

export default nextConfig;

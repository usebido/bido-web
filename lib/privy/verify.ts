import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";

/**
 * Privy App ID. Public — shared with the frontend SDK too.
 */
export const PRIVY_APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID!;

/**
 * Minimum shape of the Privy access-token payload we rely on.
 * `sub` is the Privy DID and is what we propagate into the Supabase JWT's `sub`
 * claim so RLS (`auth.jwt() ->> 'sub'`) matches `sponsors.privy_id`.
 */
export interface PrivyJwtPayload extends JWTPayload {
  sub: string;
  email?: string;
  iat: number;
  exp: number;
}

const JWKS = createRemoteJWKSet(
  new URL(`https://auth.privy.io/api/v1/apps/${PRIVY_APP_ID}/jwks.json`)
);

/**
 * Verifies a Privy-issued access token against the Privy JWKS.
 * Throws on invalid signature, expired token, wrong issuer or wrong audience.
 */
export async function verifyPrivyToken(token: string): Promise<PrivyJwtPayload> {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: "privy.io",
    audience: PRIVY_APP_ID,
  });

  if (typeof payload.sub !== "string") {
    throw new Error("Privy token missing `sub` claim");
  }

  return payload as PrivyJwtPayload;
}

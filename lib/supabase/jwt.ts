import { SignJWT } from "jose";

const ONE_HOUR_SECONDS = 60 * 60;

export interface CreateSupabaseJwtParams {
  privyUserId: string;
  email?: string;
  sponsorId?: string;
}

/**
 * Mints a Supabase-compatible JWT signed with SUPABASE_JWT_SECRET (HS256).
 *
 * The `sub` claim is set to the Privy DID — this is what the RLS policies
 * match against `sponsors.privy_id` via `auth.jwt() ->> 'sub'`.
 *
 * Supabase requires `role` and `aud` to equal `"authenticated"` for the JWT
 * to be treated as a logged-in user.
 */
export async function createSupabaseJwt(
  params: CreateSupabaseJwtParams
): Promise<string> {
  const secret = process.env.SUPABASE_JWT_SECRET;
  if (!secret) throw new Error("SUPABASE_JWT_SECRET is not set");

  const now = Math.floor(Date.now() / 1000);
  const key = new TextEncoder().encode(secret);

  const payload: Record<string, unknown> = {
    sub: params.privyUserId,
    role: "authenticated",
  };
  if (params.email) payload.email = params.email;
  if (params.sponsorId) payload.sponsor_id = params.sponsorId;

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer("bido-backend")
    .setAudience("authenticated")
    .setIssuedAt(now)
    .setExpirationTime(now + ONE_HOUR_SECONDS)
    .sign(key);
}

import { NextResponse, type NextRequest } from "next/server";
import { verifyPrivyToken, type PrivyJwtPayload } from "@/lib/privy/verify";

export type PrivyAuthResult =
  | { ok: true; payload: PrivyJwtPayload }
  | { ok: false; response: NextResponse };

/**
 * Reads the `Authorization: Bearer …` header off an incoming request and
 * verifies it against the Privy JWKS. Returns a discriminated union so the
 * caller can either proceed with the decoded payload or short-circuit with
 * the prepared error response.
 */
export async function authenticatePrivyRequest(
  request: NextRequest
): Promise<PrivyAuthResult> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing bearer token" }, { status: 401 }),
    };
  }
  const token = authHeader.slice(7).trim();
  if (!token) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Missing bearer token" }, { status: 401 }),
    };
  }

  try {
    const payload = await verifyPrivyToken(token);
    return { ok: true, payload };
  } catch (err) {
    console.error("[privy-auth] token verification failed:", err);
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid token" }, { status: 401 }),
    };
  }
}

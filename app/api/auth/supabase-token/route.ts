import { NextResponse, type NextRequest } from "next/server";
import { verifyPrivyToken } from "@/lib/privy/verify";
import { createSupabaseJwt } from "@/lib/supabase/jwt";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.toLowerCase().startsWith("bearer ")) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }
    const privyToken = authHeader.slice(7).trim();
    if (!privyToken) {
      return NextResponse.json({ error: "Missing bearer token" }, { status: 401 });
    }

    let payload;
    try {
      payload = await verifyPrivyToken(privyToken);
    } catch (err) {
      console.error("[supabase-token] Privy verification failed:", err);
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const privyUserId = payload.sub;
    const email = typeof payload.email === "string" ? payload.email : undefined;

    // Look up the sponsor (may not exist yet — /api/sponsors/sync creates it).
    const admin = createAdminClient();
    const { data: sponsor, error: sponsorErr } = await admin
      .from("sponsors")
      .select("id")
      .eq("privy_id", privyUserId)
      .maybeSingle();

    if (sponsorErr) {
      console.error("[supabase-token] sponsor lookup failed:", sponsorErr);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    const supabaseToken = await createSupabaseJwt({
      privyUserId,
      email,
      sponsorId: sponsor?.id,
    });

    return NextResponse.json({ supabaseToken });
  } catch (err) {
    console.error("[supabase-token] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

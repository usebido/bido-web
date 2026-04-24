import { NextResponse, type NextRequest } from "next/server";
import { authenticatePrivyRequest } from "@/lib/api/privy-auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticatePrivyRequest(request);
    if (!auth.ok) return auth.response;

    const admin = createAdminClient();
    const { data, error } = await admin
      .from("sponsors")
      .select("*")
      .eq("privy_id", auth.payload.sub)
      .maybeSingle();

    if (error) {
      console.error("[sponsors/me] lookup failed:", error);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Sponsor not found. Call /api/sponsors/sync first." },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error("[sponsors/me] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

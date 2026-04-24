import { NextResponse, type NextRequest } from "next/server";
import { authenticatePrivyRequest } from "@/lib/api/privy-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSponsorSchema } from "@/lib/validators/sponsor";

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticatePrivyRequest(request);
    if (!auth.ok) return auth.response;

    const privyUserId = auth.payload.sub;
    const privyEmail =
      typeof auth.payload.email === "string" ? auth.payload.email : undefined;

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // empty body is fine — all fields are optional
    }

    const parsed = syncSponsorSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    const input = parsed.data;

    const admin = createAdminClient();

    const { data: existing, error: lookupErr } = await admin
      .from("sponsors")
      .select("*")
      .eq("privy_id", privyUserId)
      .maybeSingle();

    if (lookupErr) {
      console.error("[sponsors/sync] lookup failed:", lookupErr);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }

    if (!existing) {
      const { data: inserted, error: insertErr } = await admin
        .from("sponsors")
        .insert({
          privy_id: privyUserId,
          email: input.email ?? privyEmail ?? null,
          name: input.name ?? null,
          wallet_address: input.walletAddress ?? null,
        })
        .select("*")
        .single();

      if (insertErr) {
        console.error("[sponsors/sync] insert failed:", insertErr);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
      }
      return NextResponse.json(inserted, { status: 201 });
    }

    // Build a patch with only the fields the caller actually provided, so we
    // don't clobber existing values with undefined.
    const patch: Record<string, string> = {};
    if (input.email !== undefined) patch.email = input.email;
    if (input.name !== undefined) patch.name = input.name;
    if (input.walletAddress !== undefined) patch.wallet_address = input.walletAddress;

    if (Object.keys(patch).length === 0) {
      return NextResponse.json(existing);
    }

    const { data: updated, error: updateErr } = await admin
      .from("sponsors")
      .update(patch)
      .eq("id", existing.id)
      .select("*")
      .single();

    if (updateErr) {
      console.error("[sponsors/sync] update failed:", updateErr);
      return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    console.error("[sponsors/sync] unexpected error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

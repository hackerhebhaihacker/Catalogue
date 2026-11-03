import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  // Use service-role client to bypass RLS
  const adminDb = await createAdminClient();

  try {
    const { data, error: dbErr } = await adminDb
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (dbErr) throw dbErr;
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/orders GET]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  try {
    const { data, error: dbErr } = await supabase!
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

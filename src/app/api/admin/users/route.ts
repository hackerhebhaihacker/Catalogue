import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";

export async function GET() {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  try {
    const { data, error: dbError } = await supabase!
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) throw dbError;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/users GET]", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

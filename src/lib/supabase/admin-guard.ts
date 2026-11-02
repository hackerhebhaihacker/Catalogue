import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * Verifies the caller is an authenticated admin.
 * Returns { supabase, userId } on success, or a NextResponse (401/403) on failure.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      supabase: null,
      userId: null,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      supabase: null,
      userId: null,
    };
  }

  return { error: null, supabase, userId: user.id };
}

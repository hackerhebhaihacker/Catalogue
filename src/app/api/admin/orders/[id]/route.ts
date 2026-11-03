import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { z } from "zod";

const statuses = ["pending","confirmed","processing","dispatched","delivered","cancelled"] as const;
const schema = z.object({
  status:      z.enum(statuses).optional(),
  admin_notes: z.string().max(1000).optional(),
});

interface RouteParams { params: Promise<{ id: string }>; }

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { data, error: dbErr } = await supabase!
      .from("orders")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (dbErr) throw dbErr;
    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { z } from "zod";

const patchSchema = z.object({
  product_name: z.string().min(2).max(200).optional(),
  description: z.string().min(5).optional(),
  category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { data, error: dbError } = await supabase!
      .from("products")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/products PATCH]", err);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  const { id } = await params;

  try {
    const { error: dbError } = await supabase!
      .from("products")
      .delete()
      .eq("id", id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[admin/products DELETE]", err);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}

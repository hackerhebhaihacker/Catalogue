import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { z } from "zod";
import { slugify } from "@/lib/utils";

const schema = z.object({
  product_name: z.string().min(2).max(200),
  description: z.string().min(5),
  category_id: z.string().uuid().nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  price: z.number().positive().nullable().optional(),
  is_featured: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export async function POST(request: Request) {
  const { error, supabase } = await requireAdmin();
  if (error) return error;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    const { data, error: dbError } = await supabase!
      .from("products")
      .insert({
        ...parsed.data,
        category_id: parsed.data.category_id ?? null,
        image_url: parsed.data.image_url ?? null,
        price: parsed.data.price ?? null,
        is_featured: parsed.data.is_featured ?? false,
        is_active: parsed.data.is_active ?? true,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("[admin/products POST]", err);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// Keep the slugify import used above from triggering lint
void slugify;

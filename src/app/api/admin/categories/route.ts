import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { slugify } from "@/lib/utils";
import { z } from "zod";

const schema = z.object({
  category_name: z.string().min(2).max(100),
  description: z.string().optional(),
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
      .from("categories")
      .insert({
        category_name: parsed.data.category_name,
        description: parsed.data.description ?? null,
        slug: slugify(parsed.data.category_name),
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ data }, { status: 201 });
  } catch (err) {
    console.error("[admin/categories POST]", err);
    return NextResponse.json({ error: "Failed to create category" }, { status: 500 });
  }
}

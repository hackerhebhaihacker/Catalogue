import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { createAdminClient } from "@/lib/supabase/server";
import { z } from "zod";
import { sendOrderStatusUpdateToCustomer } from "@/lib/email";

const statuses = ["pending","confirmed","processing","dispatched","delivered","cancelled"] as const;

const schema = z.object({
  status:      z.enum(statuses).optional(),
  admin_notes: z.string().max(1000).optional(),
});

interface RouteParams { params: Promise<{ id: string }>; }

export async function PATCH(request: Request, { params }: RouteParams) {
  // Auth check — verify admin role
  const { error } = await requireAdmin();
  if (error) return error;

  // Use service-role client for DB ops to bypass RLS
  const adminDb = await createAdminClient();
  const { id } = await params;

  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 });
    }

    // Fetch existing order for comparison + email data
    const { data: existingOrder, error: fetchErr } = await adminDb
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    if (fetchErr || !existingOrder) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    // Apply update
    const { data, error: dbErr } = await adminDb
      .from("orders")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (dbErr) throw dbErr;

    // Send status update email to customer (non-blocking)
    if (parsed.data.status && existingOrder.status !== parsed.data.status) {
      sendOrderStatusUpdateToCustomer({
        customerName:  existingOrder.customer_name,
        customerEmail: existingOrder.customer_email,
        orderNumber:   existingOrder.order_number,
        newStatus:     parsed.data.status,
        adminNotes:    parsed.data.admin_notes ?? existingOrder.admin_notes ?? null,
        items: (existingOrder.order_items ?? []).map((i: {
          product_name: string; category: string | null; price: number | null; quantity: number;
        }) => ({
          product_name: i.product_name,
          category:     i.category ?? "Uncategorised",
          price:        i.price,
          quantity:     i.quantity,
        })),
        subtotal: existingOrder.subtotal,
      }).catch(err => console.error("[status email]", err));
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

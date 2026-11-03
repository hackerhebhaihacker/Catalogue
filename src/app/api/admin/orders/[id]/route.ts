import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/admin-guard";
import { z } from "zod";
import { sendOrderStatusUpdateToCustomer } from "@/lib/email";

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

    // Fetch order before update to get customer info
    const { data: existingOrder } = await supabase!
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", id)
      .single();

    // Apply the update
    const { data, error: dbErr } = await supabase!
      .from("orders")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select("*, order_items(*)")
      .single();

    if (dbErr) throw dbErr;

    // Send status update email if status changed and we have order data
    if (parsed.data.status && existingOrder && existingOrder.status !== parsed.data.status) {
      await sendOrderStatusUpdateToCustomer({
        customerName:  existingOrder.customer_name,
        customerEmail: existingOrder.customer_email,
        orderNumber:   existingOrder.order_number,
        newStatus:     parsed.data.status,
        adminNotes:    parsed.data.admin_notes ?? existingOrder.admin_notes ?? null,
        items:         (existingOrder.order_items ?? []).map((i: {
          product_name: string; category: string | null; price: number | null; quantity: number;
        }) => ({
          product_name: i.product_name,
          category:     i.category ?? "Uncategorised",
          price:        i.price,
          quantity:     i.quantity,
        })),
        subtotal: existingOrder.subtotal,
      }).catch(err => console.error("[order status email]", err)); // non-blocking
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error("[admin/orders PATCH]", err);
    return NextResponse.json({ error: "Failed to update order." }, { status: 500 });
  }
}

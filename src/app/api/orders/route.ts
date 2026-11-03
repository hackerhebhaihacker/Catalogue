import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendOrderConfirmationToCustomer, sendNewOrderAlertToAdmin } from "@/lib/email";

const itemSchema = z.object({
  id:           z.string(),
  product_name: z.string().min(1),
  category:     z.string().default("Uncategorised"),
  price:        z.number().nullable(),
  quantity:     z.number().int().positive(),
});

const bodySchema = z.object({
  items:  z.array(itemSchema).min(1, "Cart cannot be empty"),
  notes:  z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    /* ── Auth check ── */
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "You must be logged in to place an order." }, { status: 401 });
    }

    /* ── Parse body ── */
    const raw = await request.json();
    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message ?? "Invalid input" }, { status: 400 });
    }
    const { items, notes } = parsed.data;

    /* ── Fetch customer profile ── */
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email, mobile_number")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: "Profile not found. Please complete your registration." }, { status: 404 });
    }

    /* ── Calculate subtotal ── */
    const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

    /* ── Use service-role client to bypass RLS on insert ── */
    const adminClient = await createAdminClient();

    /* ── Insert order ── */
    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .insert({
        order_number:   "", // trigger will fill this
        customer_id:    user.id,
        customer_name:  profile.full_name,
        customer_email: profile.email,
        customer_phone: profile.mobile_number ?? null,
        status:         "pending",
        subtotal,
        notes:          notes ?? null,
      })
      .select()
      .single();

    if (orderErr || !order) {
      console.error("[orders POST] insert order:", orderErr);
      return NextResponse.json({ error: "Failed to create order. Please try again." }, { status: 500 });
    }

    /* ── Insert order items ── */
    const orderItems = items.map(i => ({
      order_id:     order.id,
      product_id:   null,          // no FK enforcement — products may change
      product_name: i.product_name,
      category:     i.category,
      price:        i.price,
      quantity:     i.quantity,
    }));

    const { error: itemsErr } = await adminClient.from("order_items").insert(orderItems);
    if (itemsErr) {
      console.error("[orders POST] insert items:", itemsErr);
      // still return the order — items failure is non-critical for the customer
    }

    /* ── Emails (non-blocking) ── */
    await Promise.allSettled([
      sendOrderConfirmationToCustomer({
        customerName:  profile.full_name,
        customerEmail: profile.email,
        orderNumber:   order.order_number,
        items,
        subtotal,
        placedAt:      order.created_at,
      }),
      sendNewOrderAlertToAdmin({
        orderNumber:   order.order_number,
        customerName:  profile.full_name,
        customerEmail: profile.email,
        customerPhone: profile.mobile_number ?? null,
        items,
        subtotal,
        notes:         notes ?? null,
        placedAt:      order.created_at,
      }),
    ]);

    return NextResponse.json(
      { success: true, orderId: order.id, orderNumber: order.order_number },
      { status: 201 }
    );
  } catch (err) {
    console.error("[orders POST] unexpected:", err);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

/* ── GET — fetch the current user's orders ── */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: orders, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ data: orders });
  } catch (err) {
    console.error("[orders GET]", err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

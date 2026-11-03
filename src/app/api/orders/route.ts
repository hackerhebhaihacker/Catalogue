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
  items: z.array(itemSchema).min(1, "Cart cannot be empty"),
  notes: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    /* ── 1. Auth check using anon client ── */
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();

    if (authErr || !user) {
      console.error("[orders POST] auth error:", authErr?.message ?? "no user");
      return NextResponse.json(
        { error: "You must be logged in to place an order." },
        { status: 401 }
      );
    }

    /* ── 2. Parse + validate body ── */
    let raw: unknown;
    try { raw = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid request body." }, { status: 400 }); }

    const parsed = bodySchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }
    const { items, notes } = parsed.data;

    /* ── 3. Use service-role client for ALL database operations ──
           This bypasses RLS entirely, which is correct because we
           already verified the user is authenticated above.        ── */
    const adminClient = await createAdminClient();

    /* ── 4. Fetch customer profile via service-role (bypasses RLS) ── */
    const { data: profile, error: profileErr } = await adminClient
      .from("profiles")
      .select("full_name, email, mobile_number")
      .eq("id", user.id)
      .single();

    if (profileErr || !profile) {
      console.error("[orders POST] profile fetch:", profileErr?.message ?? "not found", "user:", user.id);
      return NextResponse.json(
        { error: "Profile not found. Please sign out and sign back in." },
        { status: 404 }
      );
    }

    /* ── 5. Calculate subtotal ── */
    const subtotal = items.reduce((sum, i) => sum + (i.price ?? 0) * i.quantity, 0);

    /* ── 6. Insert order (order_number filled by DB trigger) ── */
    const { data: order, error: orderErr } = await adminClient
      .from("orders")
      .insert({
        order_number:   "",   // trigger fills this from WHEN condition
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
      console.error("[orders POST] insert order:", orderErr?.message ?? "no order returned", orderErr?.details, orderErr?.hint);
      return NextResponse.json(
        { error: `Failed to create order: ${orderErr?.message ?? "unknown error"}` },
        { status: 500 }
      );
    }

    /* ── 7. Insert order items ── */
    const orderItemRows = items.map(i => ({
      order_id:     order.id,
      product_id:   null,
      product_name: i.product_name,
      category:     i.category,
      price:        i.price,
      quantity:     i.quantity,
    }));

    const { error: itemsErr } = await adminClient.from("order_items").insert(orderItemRows);
    if (itemsErr) {
      console.error("[orders POST] insert items:", itemsErr.message);
      // Not fatal — order was created, items failure is secondary
    }

    /* ── 8. Send emails (non-blocking — failure does NOT break the order) ── */
    const emailPayload = {
      customerName:  profile.full_name,
      customerEmail: profile.email,
      orderNumber:   order.order_number,
      items,
      subtotal,
      placedAt:      order.created_at,
    };

    Promise.allSettled([
      sendOrderConfirmationToCustomer(emailPayload).catch(e =>
        console.error("[orders POST] customer email failed:", e?.message ?? e)
      ),
      sendNewOrderAlertToAdmin({
        orderNumber:   order.order_number,
        customerName:  profile.full_name,
        customerEmail: profile.email,
        customerPhone: profile.mobile_number ?? null,
        items,
        subtotal,
        notes:         notes ?? null,
        placedAt:      order.created_at,
      }).catch(e =>
        console.error("[orders POST] admin email failed:", e?.message ?? e)
      ),
    ]);

    return NextResponse.json(
      { success: true, orderId: order.id, orderNumber: order.order_number },
      { status: 201 }
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[orders POST] unexpected:", msg);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${msg}` },
      { status: 500 }
    );
  }
}

/* ── GET — customer's own orders ── */
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use service-role client to read customer's orders (bypasses RLS complexity)
    const adminClient = await createAdminClient();
    const { data: orders, error } = await adminClient
      .from("orders")
      .select("*, order_items(*)")
      .eq("customer_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[orders GET]", error.message);
      throw error;
    }
    return NextResponse.json({ data: orders ?? [] });
  } catch (err: unknown) {
    console.error("[orders GET] unexpected:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: "Failed to fetch orders." }, { status: 500 });
  }
}

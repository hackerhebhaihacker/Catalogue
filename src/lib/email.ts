import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY environment variable is not set.");
  return new Resend(key);
}

function getFrom() {
  return `${siteConfig.name} <noreply@${process.env.RESEND_DOMAIN ?? "nexuscommerce.com"}>`;
}

/* ── WELCOME EMAIL ─────────────────────────────────────────────────────────── */
export async function sendWelcomeEmail({ fullName, email }: { fullName: string; email: string }) {
  return getResend().emails.send({
    from: getFrom(),
    to: email,
    subject: `Welcome to ${siteConfig.name}!`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
    <div style="background:linear-gradient(135deg,#4f46e5,#3730a3);padding:40px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:28px;">Welcome, ${fullName}!</h1>
      <p style="color:#c7d2fe;margin:8px 0 0;">You've successfully joined ${siteConfig.name}</p>
    </div>
    <div style="padding:40px;">
      <p style="color:#374151;font-size:16px;line-height:1.6;">
        Your account is now active. Browse our complete product catalogue and place orders directly from the site.
      </p>
      <div style="margin:32px 0;text-align:center;">
        <a href="${siteConfig.url}/products" style="background:#4f46e5;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:600;font-size:16px;">
          Browse Products
        </a>
      </div>
      <p style="color:#6b7280;font-size:14px;">
        Questions? <a href="mailto:${siteConfig.email}" style="color:#4f46e5;">${siteConfig.email}</a>
      </p>
    </div>
  </div>
</body></html>`,
  });
}

/* ── ADMIN REGISTRATION ALERT ──────────────────────────────────────────────── */
export async function sendAdminRegistrationAlert({
  fullName, email, mobileNumber, registeredAt,
}: {
  fullName: string; email: string; mobileNumber: string; registeredAt: string;
}) {
  return getResend().emails.send({
    from: getFrom(),
    to: siteConfig.adminEmail,
    subject: `New User Registration – ${fullName}`,
    html: `<!DOCTYPE html><html><body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <div style="background:#1e293b;padding:32px;text-align:center;">
      <h2 style="color:#fff;margin:0;font-size:22px;">New User Registration</h2>
      <p style="color:#94a3b8;margin:6px 0 0;">A new user has registered on ${siteConfig.name}</p>
    </div>
    <div style="padding:32px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;width:140px;">Full Name</td><td style="padding:10px 0;color:#1e293b;font-weight:600;">${fullName}</td></tr>
        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;">Email</td><td style="padding:10px 0;"><a href="mailto:${email}" style="color:#4f46e5;">${email}</a></td></tr>
        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;">Mobile</td><td style="padding:10px 0;color:#1e293b;">${mobileNumber}</td></tr>
        <tr><td style="padding:10px 0;color:#64748b;font-size:14px;">Registered At</td><td style="padding:10px 0;color:#1e293b;">${new Date(registeredAt).toLocaleString("en-IN")}</td></tr>
      </table>
      <div style="margin-top:24px;text-align:center;">
        <a href="${siteConfig.url}/admin" style="background:#1e293b;color:#fff;padding:12px 28px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:600;">
          View Admin Dashboard
        </a>
      </div>
    </div>
  </div>
</body></html>`,
  });
}

/* ── ORDER HELPERS ─────────────────────────────────────────────────────────── */
interface OrderItem {
  product_name: string;
  category: string;
  price: number | null;
  quantity: number;
}

function formatINR(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
}

function itemsTableHtml(items: OrderItem[]) {
  const rows = items.map(i => `
    <tr style="border-bottom:1px solid #f1f5f9;">
      <td style="padding:10px 8px;color:#1c1917;font-size:14px;">${i.product_name}</td>
      <td style="padding:10px 8px;color:#78716c;font-size:14px;">${i.category}</td>
      <td style="padding:10px 8px;text-align:center;color:#1c1917;font-size:14px;">${i.quantity}</td>
      <td style="padding:10px 8px;text-align:right;color:#1c1917;font-size:14px;font-weight:600;">
        ${i.price != null ? formatINR(i.price * i.quantity) : "On request"}
      </td>
    </tr>`).join("");
  return `<table style="width:100%;border-collapse:collapse;margin-top:16px;">
    <thead>
      <tr style="background:#f4f3f0;">
        <th style="padding:10px 8px;text-align:left;font-size:12px;color:#78716c;font-weight:600;text-transform:uppercase;">Product</th>
        <th style="padding:10px 8px;text-align:left;font-size:12px;color:#78716c;font-weight:600;text-transform:uppercase;">Category</th>
        <th style="padding:10px 8px;text-align:center;font-size:12px;color:#78716c;font-weight:600;text-transform:uppercase;">Qty</th>
        <th style="padding:10px 8px;text-align:right;font-size:12px;color:#78716c;font-weight:600;text-transform:uppercase;">Total</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>`;
}

/* ── ORDER CONFIRMATION → CUSTOMER ─────────────────────────────────────────── */
export async function sendOrderConfirmationToCustomer({
  customerName, customerEmail, orderNumber, items, subtotal, placedAt,
}: {
  customerName: string; customerEmail: string; orderNumber: string;
  items: OrderItem[]; subtotal: number; placedAt: string;
}) {
  return getResend().emails.send({
    from: getFrom(),
    to: customerEmail,
    subject: `Order Confirmed — ${orderNumber} | ${siteConfig.name}`,
    html: `<!DOCTYPE html><html><body style="font-family:'Inter',sans-serif;background:#faf9f7;padding:40px 0;margin:0;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:linear-gradient(135deg,#312e81,#4f46e5);padding:40px;text-align:center;">
      <div style="width:56px;height:56px;background:rgba(255,255,255,0.15);border-radius:14px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:16px;">
        <span style="font-size:28px;">🛒</span>
      </div>
      <h1 style="color:#fff;margin:0;font-size:24px;font-weight:700;">Order Confirmed!</h1>
      <p style="color:rgba(199,210,254,0.85);margin:8px 0 0;font-size:14px;">Thank you, ${customerName}</p>
    </div>
    <div style="padding:36px;">
      <div style="background:#f4f3f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:16px;">
          <div>
            <p style="margin:0;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.07em;font-weight:600;">Order Number</p>
            <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#4f46e5;">${orderNumber}</p>
          </div>
          <div>
            <p style="margin:0;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.07em;font-weight:600;">Placed On</p>
            <p style="margin:4px 0 0;font-size:14px;color:#1c1917;">${new Date(placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>
          </div>
          <div>
            <p style="margin:0;font-size:11px;color:#78716c;text-transform:uppercase;letter-spacing:.07em;font-weight:600;">Status</p>
            <span style="display:inline-block;margin-top:4px;background:#fef9c3;color:#854d0e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">Pending Review</span>
          </div>
        </div>
      </div>
      <h3 style="color:#1c1917;font-size:15px;font-weight:700;margin:0 0 4px;">Your Items</h3>
      ${itemsTableHtml(items)}
      <div style="margin-top:16px;padding:14px 16px;background:#f4f3f0;border-radius:10px;display:flex;justify-content:space-between;align-items:center;">
        <span style="font-size:14px;color:#78716c;font-weight:600;">Subtotal</span>
        <span style="font-size:20px;color:#1c1917;font-weight:800;">${subtotal > 0 ? formatINR(subtotal) : "Price on request"}</span>
      </div>
      <div style="margin-top:28px;padding:18px;background:#eef2ff;border-radius:12px;border:1px solid rgba(79,70,229,0.15);">
        <p style="margin:0;font-size:14px;color:#4f46e5;line-height:1.6;">
          <strong>What happens next?</strong><br>
          Our team will review your order and contact you within <strong>24 hours</strong> to confirm availability and arrange delivery.
        </p>
      </div>
      <div style="margin-top:28px;text-align:center;">
        <a href="${siteConfig.url}/dashboard" style="display:inline-block;background:#4f46e5;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
          Track Your Order
        </a>
      </div>
      <hr style="border:none;border-top:1px solid #e7e5e4;margin:28px 0;">
      <p style="color:#a8a29e;font-size:12px;text-align:center;margin:0;">
        Questions? <a href="mailto:${siteConfig.email}" style="color:#4f46e5;">${siteConfig.email}</a>
      </p>
    </div>
  </div>
</body></html>`,
  });
}

/* ── NEW ORDER ALERT → ADMIN ────────────────────────────────────────────────── */
export async function sendNewOrderAlertToAdmin({
  orderNumber, customerName, customerEmail, customerPhone,
  items, subtotal, notes, placedAt,
}: {
  orderNumber: string; customerName: string; customerEmail: string;
  customerPhone: string | null; items: OrderItem[];
  subtotal: number; notes: string | null; placedAt: string;
}) {
  return getResend().emails.send({
    from: getFrom(),
    to: siteConfig.adminEmail,
    subject: `🛒 New Order ${orderNumber} — ${customerName}`,
    html: `<!DOCTYPE html><html><body style="font-family:'Inter',sans-serif;background:#faf9f7;padding:40px 0;margin:0;">
  <div style="max-width:580px;margin:0 auto;background:#fff;border-radius:20px;overflow:hidden;border:1px solid #e7e5e4;">
    <div style="background:#141210;padding:32px;text-align:center;">
      <h2 style="color:#fff;margin:0;font-size:20px;font-weight:700;">🛒 New Order Received</h2>
      <p style="color:#a8a29e;margin:6px 0 0;font-size:14px;">Action required — review and confirm</p>
    </div>
    <div style="padding:32px;">
      <div style="background:#f4f3f0;border-radius:12px;padding:20px;margin-bottom:24px;">
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;width:120px;">Order #</td><td style="padding:8px 0;font-size:18px;font-weight:800;color:#4f46e5;">${orderNumber}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;">Customer</td><td style="padding:8px 0;font-size:13px;color:#1c1917;font-weight:600;">${customerName}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;">Email</td><td style="padding:8px 0;font-size:13px;"><a href="mailto:${customerEmail}" style="color:#4f46e5;">${customerEmail}</a></td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;">Phone</td><td style="padding:8px 0;font-size:13px;color:#1c1917;">${customerPhone ?? "—"}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;">Placed At</td><td style="padding:8px 0;font-size:13px;color:#1c1917;">${new Date(placedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td></tr>
          <tr><td style="padding:8px 0;font-size:13px;color:#78716c;">Subtotal</td><td style="padding:8px 0;font-size:16px;font-weight:800;color:#1c1917;">${subtotal > 0 ? formatINR(subtotal) : "Price on request"}</td></tr>
        </table>
      </div>
      <h3 style="color:#1c1917;font-size:15px;font-weight:700;margin:0 0 4px;">Order Items</h3>
      ${itemsTableHtml(items)}
      ${notes ? `<div style="margin-top:16px;padding:14px;background:#fefce8;border-radius:10px;border:1px solid #fde68a;"><p style="margin:0;font-size:13px;color:#854d0e;"><strong>Customer Note:</strong> ${notes}</p></div>` : ""}
      <div style="margin-top:28px;text-align:center;">
        <a href="${siteConfig.url}/admin" style="display:inline-block;background:#141210;color:#fff;padding:14px 32px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px;">
          Open Admin Dashboard →
        </a>
      </div>
    </div>
  </div>
</body></html>`,
  });
}

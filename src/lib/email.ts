import { Resend } from "resend";
import { siteConfig } from "@/lib/site-config";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = `${siteConfig.name} <noreply@${process.env.RESEND_DOMAIN ?? "nexuscommerce.com"}>`;

export async function sendWelcomeEmail({
  fullName,
  email,
}: {
  fullName: string;
  email: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: email,
    subject: `Welcome to ${siteConfig.name}!`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;border:1px solid #e2e8f0;">
          <div style="background:linear-gradient(135deg,#2563EB,#1d4ed8);padding:40px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:28px;">Welcome, ${fullName}!</h1>
            <p style="color:#bfdbfe;margin:8px 0 0;">You've successfully joined ${siteConfig.name}</p>
          </div>
          <div style="padding:40px;">
            <p style="color:#374151;font-size:16px;line-height:1.6;">
              Thank you for registering with <strong>${siteConfig.name}</strong>. Your account is now active and you can access our complete product catalogue.
            </p>
            <div style="margin:32px 0;text-align:center;">
              <a href="${siteConfig.url}/products" style="background:#2563EB;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px;">
                Browse Products
              </a>
            </div>
            <p style="color:#6b7280;font-size:14px;">
              If you have any questions, feel free to contact us at <a href="mailto:${siteConfig.email}" style="color:#2563EB;">${siteConfig.email}</a>.
            </p>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />
            <p style="color:#9ca3af;font-size:12px;text-align:center;">
              © ${new Date().getFullYear()} ${siteConfig.name} · ${siteConfig.address}
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

export async function sendAdminRegistrationAlert({
  fullName,
  email,
  mobileNumber,
  registeredAt,
}: {
  fullName: string;
  email: string;
  mobileNumber: string;
  registeredAt: string;
}) {
  return resend.emails.send({
    from: FROM,
    to: siteConfig.adminEmail,
    subject: `New User Registration – ${fullName}`,
    html: `
      <!DOCTYPE html>
      <html>
      <body style="font-family:sans-serif;background:#f8fafc;padding:40px 0;margin:0;">
        <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
          <div style="background:#1e293b;padding:32px;text-align:center;">
            <h2 style="color:#fff;margin:0;font-size:22px;">New User Registration</h2>
            <p style="color:#94a3b8;margin:6px 0 0;">A new user has registered on ${siteConfig.name}</p>
          </div>
          <div style="padding:32px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-size:14px;width:140px;">Full Name</td>
                <td style="padding:12px 0;color:#1e293b;font-weight:600;">${fullName}</td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-size:14px;">Email</td>
                <td style="padding:12px 0;"><a href="mailto:${email}" style="color:#2563EB;">${email}</a></td>
              </tr>
              <tr style="border-bottom:1px solid #f1f5f9;">
                <td style="padding:12px 0;color:#64748b;font-size:14px;">Mobile</td>
                <td style="padding:12px 0;color:#1e293b;">${mobileNumber}</td>
              </tr>
              <tr>
                <td style="padding:12px 0;color:#64748b;font-size:14px;">Registered At</td>
                <td style="padding:12px 0;color:#1e293b;">${new Date(registeredAt).toLocaleString()}</td>
              </tr>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="${siteConfig.url}/admin" style="background:#1e293b;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600;">
                View Admin Dashboard
              </a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

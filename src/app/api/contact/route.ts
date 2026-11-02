import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";
import { siteConfig } from "@/lib/site-config";

// Lazy — avoids build-time crash when RESEND_API_KEY is not set
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set.");
  return new Resend(key);
}

const schema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Please fill in all fields correctly." },
        { status: 400 }
      );
    }

    const { name, email, subject, message } = parsed.data;

    await getResend().emails.send({
      from: `${siteConfig.name} Contact Form <noreply@${process.env.RESEND_DOMAIN ?? "nexuscommerce.com"}>`,
      to: siteConfig.adminEmail,
      replyTo: email,
      subject: `Contact Form: ${subject}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
          <h2 style="color:#2563EB;">New Contact Form Submission</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;font-weight:bold;width:120px;">Name:</td><td style="padding:8px;">${name}</td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Email:</td><td style="padding:8px;"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px;font-weight:bold;">Subject:</td><td style="padding:8px;">${subject}</td></tr>
          </table>
          <div style="margin-top:16px;padding:16px;background:#f8f9fa;border-radius:8px;">
            <strong>Message:</strong>
            <p style="white-space:pre-wrap;margin-top:8px;">${message}</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[contact]", err);
    return NextResponse.json({ error: "Failed to send message." }, { status: 500 });
  }
}

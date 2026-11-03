import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
        <p className="text-slate-400 mb-10 text-sm">
          Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
        </p>
        <div className="space-y-8">
          {[
            { title: "1. Information We Collect", body: `When you register on ${siteConfig.name}, we collect your full name, email address and mobile number. We also collect usage data (pages visited, device type) to improve our services.` },
            { title: "2. How We Use Your Information", body: "We use your information to manage your account, send transactional emails (welcome, password reset), and provide access to the product catalogue. We never sell your data to third parties." },
            { title: "3. Data Storage & Security", body: "Your data is stored securely in Supabase PostgreSQL. Passwords are hashed using industry-standard algorithms. All connections use HTTPS/TLS encryption." },
            { title: "4. Your Rights", body: `You have the right to access, correct or delete your personal data at any time. Contact us at ${siteConfig.email} to make a data request.` },
            { title: "5. Contact Us", body: `If you have any questions about this privacy policy, please email us at ${siteConfig.email}.` },
          ].map(({ title, body }) => (
            <section key={title} className="pb-8 border-b border-slate-100 last:border-0">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">{title}</h2>
              <p className="text-slate-500 leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

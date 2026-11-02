import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-[hsl(var(--background))]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[hsl(var(--muted-foreground))] mb-10">
          Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
        </p>

        <div className="space-y-8 text-[hsl(var(--foreground))]">
          {[
            {
              title: "1. Acceptance of Terms",
              body: `By creating an account on ${siteConfig.name}, you agree to be bound by these Terms of Service.`,
            },
            {
              title: "2. Use of Service",
              body: "You may use our platform to browse product catalogues and contact us for product enquiries. You may not use the platform for any unlawful purpose or attempt to gain unauthorised access.",
            },
            {
              title: "3. Account Responsibilities",
              body: "You are responsible for maintaining the confidentiality of your account credentials. You must notify us immediately of any unauthorised use of your account.",
            },
            {
              title: "4. Intellectual Property",
              body: `All content on this website, including product images, descriptions and branding, is the property of ${siteConfig.name} or its suppliers and is protected by copyright law.`,
            },
            {
              title: "5. Limitation of Liability",
              body: `${siteConfig.name} shall not be liable for any indirect, incidental or consequential damages arising from your use of this platform.`,
            },
            {
              title: "6. Changes to Terms",
              body: "We reserve the right to modify these terms at any time. Continued use of the platform after changes constitutes acceptance of the new terms.",
            },
            {
              title: "7. Contact",
              body: `Questions about these terms should be directed to ${siteConfig.email}.`,
            },
          ].map(({ title, body }) => (
            <section key={title}>
              <h2 className="text-xl font-semibold mb-3">{title}</h2>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">{body}</p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

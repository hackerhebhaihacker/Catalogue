import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${siteConfig.name} account to access the product catalogue.`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-subtle)" }}>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  );
}

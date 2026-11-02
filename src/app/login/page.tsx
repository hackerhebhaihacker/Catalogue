import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "@/components/auth/LoginForm";
import { siteConfig } from "@/lib/site-config";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign In",
  description: `Sign in to your ${siteConfig.name} account to access the product catalogue.`,
};

export default function LoginPage() {
  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}

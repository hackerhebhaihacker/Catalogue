import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Create Account",
  description: `Register for a free account on ${siteConfig.name} to access our full product catalogue.`,
};

export default function RegisterPage() {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center p-4"
      style={{ backgroundColor: "var(--bg-subtle)" }}>
      <RegisterForm />
    </div>
  );
}

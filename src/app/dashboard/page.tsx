import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import UserDashboard from "@/components/dashboard/UserDashboard";

export const metadata: Metadata = {
  title: "My Dashboard",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--bg)" }}>
      <UserDashboard profile={profile} />
    </div>
  );
}

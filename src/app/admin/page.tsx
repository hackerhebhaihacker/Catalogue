import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminDashboard from "@/components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") redirect("/");

  const [
    { data: products, count: productCount },
    { data: categories },
    { data: users, count: userCount },
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, category_name, slug)", { count: "exact" })
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("category_name"),
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }),
  ]);

  return (
    <div className="min-h-screen pt-16 bg-[hsl(var(--muted)/0.3)]">
      <AdminDashboard
        initialProducts={products ?? []}
        categories={categories ?? []}
        users={users ?? []}
        stats={{
          totalProducts: productCount ?? 0,
          totalUsers: userCount ?? 0,
          activeProducts: products?.filter((p) => p.is_active).length ?? 0,
          featuredProducts: products?.filter((p) => p.is_featured).length ?? 0,
        }}
      />
    </div>
  );
}

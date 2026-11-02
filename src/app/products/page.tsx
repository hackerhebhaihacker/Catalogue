import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import ProductCatalogue from "@/components/products/ProductCatalogue";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Product Catalogue",
  description: `Browse the full ${siteConfig.name} product catalogue.`,
};

export default async function ProductsPage() {
  const supabase = await createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*, categories(id, category_name, slug)")
      .eq("is_active", true)
      .order("product_name"),
    supabase.from("categories").select("*").order("category_name"),
  ]);

  return (
    <div className="min-h-screen pt-16 bg-[hsl(var(--background))]">
      <ProductCatalogue
        initialProducts={products ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}

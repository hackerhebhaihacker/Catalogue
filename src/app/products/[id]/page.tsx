import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";
import AddToCartButton from "@/components/cart/AddToCartButton";

interface Props { params: Promise<{ id: string }>; }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("products").select("product_name, description").eq("id", id).single();
  if (!data) return { title: "Product Not Found" };
  return { title: data.product_name, description: data.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, categories(id, category_name, slug)")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: "var(--bg)" }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <Link href="/products"
          className="inline-flex items-center gap-2 text-sm font-medium mb-10 transition-all"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={() => {}} onMouseLeave={() => {}}>
          <ArrowLeft className="w-4 h-4" />
          Back to Catalogue
        </Link>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden border shadow-warm-xl"
            style={{ backgroundColor: "var(--bg-subtle)", borderColor: "var(--border)" }}>
            {product.image_url ? (
              <Image src={product.image_url} alt={product.product_name} fill className="object-cover" priority
                sizes="(max-width: 1024px) 100vw, 50vw" />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "var(--text-light)" }}>
                <Package className="w-12 h-12" />
                <span className="text-sm">No image available</span>
              </div>
            )}
            {product.is_featured && (
              <span className="absolute top-4 left-4 inline-flex rounded-full px-3 py-1 text-xs font-bold text-white shadow-sm"
                style={{ backgroundColor: "var(--accent)" }}>Featured</span>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {product.categories && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4" style={{ color: "var(--text-light)" }} />
                <Badge variant="secondary" className="text-xs">{product.categories.category_name}</Badge>
              </div>
            )}

            <h1 className="font-display text-3xl font-bold leading-tight mb-5" style={{ color: "var(--text)" }}>
              {product.product_name}
            </h1>

            {/* Price */}
            {product.price != null ? (
              <div className="flex items-baseline gap-3 mb-6">
                <span className="font-display text-4xl font-black" style={{ color: "var(--text)" }}>
                  {formatPrice(product.price)}
                </span>
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>incl. all taxes</span>
              </div>
            ) : (
              <p className="text-lg italic mb-6" style={{ color: "var(--text-muted)" }}>Contact us for pricing</p>
            )}

            {/* Stock */}
            <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-6 w-fit"
              style={{ borderColor: "rgba(22,163,74,0.25)", backgroundColor: "rgba(22,163,74,0.06)" }}>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "var(--success)" }} />
              <span className="text-sm font-semibold" style={{ color: "var(--success)" }}>In Stock &amp; Available</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="font-semibold mb-3" style={{ color: "var(--text)" }}>About this product</h3>
              <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>{product.description}</p>
            </div>

            {/* Add to Cart — client component */}
            <AddToCartButton
              product={{
                id: product.id,
                product_name: product.product_name,
                category: product.categories?.category_name ?? "Uncategorised",
                price: product.price,
                image_url: product.image_url,
              }}
            />

            {/* Info notice */}
            <div className="mt-6 rounded-2xl p-5 border" style={{ backgroundColor: "var(--accent-light)", borderColor: "rgba(79,70,229,0.15)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "var(--accent)" }}>
                <strong>How it works:</strong> Add items to your cart, then send us a single enquiry email for all selected products. Our team will respond within 24 hours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

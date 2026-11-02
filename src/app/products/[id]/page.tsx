import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Tag } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("product_name, description")
    .eq("id", id)
    .single();

  if (!data) return { title: "Product Not Found" };

  return {
    title: data.product_name,
    description: data.description.slice(0, 160),
  };
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
    <div className="min-h-screen pt-16 bg-[hsl(var(--background))]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back */}
        <Button variant="ghost" asChild className="mb-8 -ml-2">
          <Link href="/products">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalogue
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[hsl(var(--muted))] shadow-lg">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.product_name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-[hsl(var(--muted-foreground))]">
                No image available
              </div>
            )}
            {product.is_featured && (
              <div className="absolute top-4 left-4">
                <Badge>Featured Product</Badge>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            {/* Category */}
            {product.categories && (
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <Badge variant="secondary">{product.categories.category_name}</Badge>
              </div>
            )}

            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-4">
              {product.product_name}
            </h1>

            {/* Price */}
            {product.price != null ? (
              <div className="text-4xl font-bold text-[hsl(var(--primary))] mb-6">
                {formatPrice(product.price)}
              </div>
            ) : (
              <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
                Contact us for pricing
              </p>
            )}

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-700">In Stock &amp; Available</span>
            </div>

            {/* Description */}
            <div className="prose prose-sm max-w-none text-[hsl(var(--muted-foreground))] mb-8">
              <h3 className="text-base font-semibold text-[hsl(var(--foreground))] mb-2">Description</h3>
              <p className="leading-relaxed">{product.description}</p>
            </div>

            {/* Notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-8">
              <p className="text-sm text-blue-700">
                <strong>Interested?</strong> Contact our team to discuss pricing, bulk orders and delivery options for this product.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="flex-1">
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@nexuscommerce.com"}?subject=Enquiry: ${product.product_name}`}>
                  Enquire About This Product
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/products">Browse More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

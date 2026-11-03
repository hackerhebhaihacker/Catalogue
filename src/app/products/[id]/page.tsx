import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Tag, Package } from "lucide-react";
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
    <div className="min-h-screen pt-16 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <Button variant="ghost" asChild className="mb-8 -ml-2 text-slate-500 hover:text-slate-900">
          <Link href="/products">
            <ArrowLeft className="w-4 h-4" />
            Back to Catalogue
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-slate-100 shadow-lg border border-slate-200">
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
              <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-400">
                <Package className="w-12 h-12" />
                <span className="text-sm">No image available</span>
              </div>
            )}
            {product.is_featured && (
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  Featured
                </span>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col">
            {/* Category */}
            {product.categories && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="w-4 h-4 text-slate-400" />
                <Badge variant="secondary" className="text-xs">{product.categories.category_name}</Badge>
              </div>
            )}

            <h1 className="text-3xl font-extrabold text-slate-900 mb-4 leading-tight">
              {product.product_name}
            </h1>

            {/* Price */}
            {product.price != null ? (
              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-blue-600">{formatPrice(product.price)}</span>
                <span className="text-sm text-slate-400">incl. all taxes</span>
              </div>
            ) : (
              <p className="text-lg text-slate-400 mb-6 italic">Contact us for pricing</p>
            )}

            {/* Stock badge */}
            <div className="flex items-center gap-2 mb-6 p-3 bg-green-50 rounded-xl border border-green-100 w-fit">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-semibold text-green-700">In Stock &amp; Available</span>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="text-base font-bold text-slate-900 mb-3">About this product</h3>
              <p className="text-slate-500 leading-relaxed">{product.description}</p>
            </div>

            {/* Info notice */}
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">
              <p className="text-sm text-blue-700 leading-relaxed">
                <strong>Interested in this product?</strong> Contact our team to discuss pricing,
                bulk orders and delivery options across India.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button size="lg" asChild className="flex-1 h-12 text-base font-semibold">
                <a href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@nexuscommerce.com"}?subject=Enquiry: ${encodeURIComponent(product.product_name)}`}>
                  Enquire About This Product
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-slate-200 text-slate-700 h-12">
                <Link href="/products">Browse More</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

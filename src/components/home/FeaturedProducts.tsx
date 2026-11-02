import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

// Demo featured products (shown on homepage to everyone)
const featuredProducts = [
  {
    id: "1",
    name: "Professional HD Webcam",
    category: "Electronics",
    description: "Crystal-clear 4K video with built-in noise-cancelling mic, perfect for remote work and content creation.",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
    badge: "Best Seller",
  },
  {
    id: "2",
    name: "Ergonomic Office Chair",
    category: "Furniture",
    description: "Lumbar-support mesh chair with adjustable armrests and breathable material for all-day comfort.",
    price: 449.00,
    image: "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80",
    badge: "Featured",
  },
  {
    id: "3",
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    description: "30-hour battery life with adaptive noise cancellation and studio-quality audio.",
    price: 279.95,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    badge: "New Arrival",
  },
  {
    id: "4",
    name: "Standing Desk Converter",
    category: "Furniture",
    description: "Gas-spring mechanism for seamless height adjustment, fits standard desks up to 80cm wide.",
    price: 189.00,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80",
    badge: "Popular",
  },
  {
    id: "5",
    name: "Smart LED Desk Lamp",
    category: "Lighting",
    description: "Touch-sensitive lamp with 5 colour temperatures, USB-C charging port and auto dimming.",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80",
    badge: "Featured",
  },
  {
    id: "6",
    name: "Mechanical Keyboard",
    category: "Electronics",
    description: "Tactile brown switches with RGB per-key lighting, aluminium frame, and dual-layer silencing.",
    price: 159.00,
    image: "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80",
    badge: "Editor's Choice",
  },
];

export default function FeaturedProducts() {
  return (
    <section id="featured" className="py-24 bg-[hsl(var(--muted)/0.3)]" aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div>
            <span className="text-sm font-semibold tracking-wider text-[hsl(var(--primary))] uppercase">
              Our Catalogue
            </span>
            <h2
              id="featured-heading"
              className="mt-2 text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
            >
              Featured Products
            </h2>
            <p className="mt-3 text-[hsl(var(--muted-foreground))] max-w-xl">
              A hand-picked selection from our premium catalogue. Register to unlock the full range.
            </p>
          </div>
          <Button variant="outline" asChild className="shrink-0">
            <Link href="/register">
              View Full Catalogue
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>

        {/* Product grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredProducts.map((product) => (
            <article
              key={product.id}
              className="bg-[hsl(var(--card))] rounded-2xl overflow-hidden border border-[hsl(var(--border))] hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col"
            >
              {/* Image */}
              <div className="relative h-56 overflow-hidden bg-[hsl(var(--muted))]">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="default" className="text-xs">{product.badge}</Badge>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-1">
                <div className="mb-1">
                  <Badge variant="secondary" className="text-xs">{product.category}</Badge>
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))] text-lg mt-2 mb-2">
                  {product.name}
                </h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))] leading-relaxed flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-5 pt-4 border-t border-[hsl(var(--border))]">
                  <span className="text-xl font-bold text-[hsl(var(--primary))]">
                    {formatPrice(product.price)}
                  </span>
                  <Button size="sm" variant="outline" asChild>
                    <Link href="/login">
                      <Lock className="w-3.5 h-3.5" />
                      View Details
                    </Link>
                  </Button>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-16 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-center text-white shadow-xl">
          <h3 className="text-2xl font-bold mb-2">Ready to Explore the Full Catalogue?</h3>
          <p className="text-blue-100 mb-6 max-w-lg mx-auto">
            Create a free account to unlock all products, detailed specifications and exclusive pricing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="border-white text-white bg-white/10 hover:bg-white/20"
            >
              <Link href="/register">Create Free Account</Link>
            </Button>
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-700 hover:bg-blue-50"
            >
              <Link href="/login">
                Sign In
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

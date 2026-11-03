"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Heart, Star, ShoppingCart, Check, Eye } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import { createClient } from "@/lib/supabase/client";
import { formatPrice } from "@/lib/utils";

const PRODUCTS = [
  { id:"feat-1", name:"Professional HD Webcam",              category:"Electronics", price:10999, originalPrice:13999, rating:4.8, reviews:124, badge:"Best Seller",   image:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80" },
  { id:"feat-2", name:"Ergonomic Office Chair",               category:"Furniture",   price:37999, originalPrice:44999, rating:4.9, reviews:89,  badge:"Top Pick",      image:"https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?w=600&q=80" },
  { id:"feat-3", name:"Wireless Noise-Cancelling Headphones", category:"Electronics", price:23499, originalPrice:29999, rating:4.7, reviews:312, badge:"New Arrival",   image:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80" },
  { id:"feat-4", name:"Standing Desk Converter",              category:"Furniture",   price:15999, originalPrice:18999, rating:4.6, reviews:67,  badge:"Popular",       image:"https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80" },
  { id:"feat-5", name:"Smart LED Desk Lamp",                  category:"Lighting",    price:6799,  originalPrice:8499,  rating:4.8, reviews:201, badge:"Featured",      image:"https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&q=80" },
  { id:"feat-6", name:"Mechanical Keyboard",                  category:"Electronics", price:13299, originalPrice:15999, rating:4.9, reviews:445, badge:"Editor's Pick", image:"https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80" },
];

/* ── Single product card ── */
function ProductCard({ product, index, isLoggedIn }: {
  product: typeof PRODUCTS[0];
  index: number;
  isLoggedIn: boolean;
}) {
  const [wished, setWished] = useState(false);
  const [added, setAdded]   = useState(false);
  const [hovered, setHovered] = useState(false);
  const { add } = useCart();
  const { toast } = useToast();
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (added) return;
    add({
      id:           product.id,
      product_name: product.name,
      category:     product.category,
      price:        product.price,
      image_url:    product.image,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    toast({ title: "Added to cart!", description: product.name });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWished(w => !w);
    toast({ title: wished ? "Removed from wishlist" : "Saved to wishlist", description: product.name });
  };

  return (
    <motion.article
      className="relative rounded-2xl overflow-hidden border cursor-pointer"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      whileHover={{ y: -6, boxShadow: "var(--shadow-xl)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      {/* Image area */}
      <div className="relative h-56 overflow-hidden" style={{ backgroundColor: "var(--bg-subtle)" }}>
        <motion.div className="absolute inset-0" animate={{ scale: hovered ? 1.07 : 1 }} transition={{ duration: 0.5 }}>
          <Image src={product.image} alt={product.name} fill className="object-cover"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw" />
        </motion.div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: "var(--accent)" }}>{product.badge}</span>
          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: "#16a34a" }}>-{discount}%</span>
        </div>

        {/* Wishlist button — only when logged in */}
        {isLoggedIn && (
          <motion.button
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
            onClick={handleWishlist}
            whileTap={{ scale: 0.8 }}
            animate={wished ? { scale: [1, 1.4, 1] } : {}}
            aria-label="Toggle wishlist">
            <Heart className="w-4 h-4" style={{ color: wished ? "#e11d48" : "var(--text-muted)", fill: wished ? "#e11d48" : "none" }} />
          </motion.button>
        )}

        {/* Hover overlay */}
        <AnimatePresence>
          {hovered && (
            <motion.div className="absolute inset-x-3 bottom-3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}>
              {isLoggedIn ? (
                // Logged in → go to product catalogue to see full details
                <Link href="/products"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "rgba(0,0,0,0.72)" }}
                  onClick={e => e.stopPropagation()}>
                  <Eye className="w-4 h-4" />Browse Catalogue
                </Link>
              ) : (
                // Not logged in → prompt to sign in
                <Link href="/login"
                  className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white"
                  style={{ backgroundColor: "rgba(0,0,0,0.72)" }}>
                  <Eye className="w-4 h-4" />Sign in to view
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
          {product.category}
        </span>
        <h3 className="font-semibold mt-1.5 mb-2 leading-snug line-clamp-1" style={{ color: "var(--text)" }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5"
                style={{ fill: i < Math.floor(product.rating) ? "#f59e0b" : "none", color: i < Math.floor(product.rating) ? "#f59e0b" : "var(--border)" }} />
            ))}
          </div>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            {product.rating} ({product.reviews})
          </span>
        </div>

        {/* Price + action */}
        <div className="flex items-center justify-between pt-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div>
            <span className="text-lg font-black" style={{ color: "var(--text)" }}>{formatPrice(product.price)}</span>
            <span className="text-xs ml-1.5 line-through" style={{ color: "var(--text-light)" }}>{formatPrice(product.originalPrice)}</span>
          </div>

          {isLoggedIn ? (
            /* ── Logged in: real Add to Cart ── */
            <motion.button
              onClick={handleAddToCart}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: added ? "#16a34a" : "var(--accent)" }}
              whileTap={{ scale: 0.93 }}
              aria-label="Add to cart">
              <AnimatePresence mode="wait">
                {added ? (
                  <motion.span key="done" className="flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <Check className="w-3.5 h-3.5" />Added!
                  </motion.span>
                ) : (
                  <motion.span key="add" className="flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <ShoppingCart className="w-3.5 h-3.5" />Add
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ) : (
            /* ── Not logged in: redirect to login ── */
            <Link href="/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              <ShoppingCart className="w-3.5 h-3.5" />Login
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}

/* ── Section ── */
export default function FeaturedProducts() {
  const { ref, inView } = useInView();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setIsLoggedIn(!!data.user));
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section id="featured" ref={ref as React.RefObject<HTMLElement>} className="py-28"
      style={{ backgroundColor: "var(--bg)" }} aria-labelledby="featured-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>Our Catalogue</span>
            <h2 id="featured-heading" className="font-display mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
              Featured Products
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed" style={{ color: "var(--text-muted)" }}>
              {isLoggedIn
                ? "Add items to your cart and place an order — we'll respond within 24 hours."
                : "A hand-picked selection from our premium catalogue. Register to unlock the full range."}
            </p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
            {isLoggedIn ? (
              <Link href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}>
                Browse Full Catalogue <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <Link href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold border transition-all"
                style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}>
                View Full Catalogue <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-7">
          {PRODUCTS.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i} isLoggedIn={isLoggedIn} />
          ))}
        </div>

        {/* CTA banner */}
        <motion.div
          className="mt-16 rounded-3xl p-10 sm:p-14 text-center overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)" }}
          initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "radial-gradient(ellipse at 80% 50%, rgba(99,102,241,0.3) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            {isLoggedIn ? (
              <>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Browse 500+ Products</h3>
                <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(199,210,254,0.85)" }}>
                  View our complete catalogue with full specifications, pricing and add items to your cart.
                </p>
                <Link href="/products"
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-indigo-900"
                  style={{ backgroundColor: "white" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e0e7ff")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}>
                  Open Full Catalogue <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            ) : (
              <>
                <h3 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">Unlock the Complete Catalogue</h3>
                <p className="mb-8 max-w-lg mx-auto" style={{ color: "rgba(199,210,254,0.85)" }}>
                  Create a free account to browse all 500+ products with full specifications and exclusive pricing.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/register"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-semibold text-indigo-900"
                    style={{ backgroundColor: "white" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#e0e7ff")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "white")}>
                    Create Free Account <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link href="/login"
                    className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-medium border transition-all"
                    style={{ borderColor: "rgba(255,255,255,0.3)", color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(255,255,255,0.08)" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.08)")}>
                    <ShoppingCart className="w-4 h-4" />Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

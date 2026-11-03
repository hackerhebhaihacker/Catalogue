"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Heart, Star, Eye, ShoppingCart, Check, Package } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory, Category } from "@/types/database";

interface Props { initialProducts: ProductWithCategory[]; categories: Category[]; }
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc";

function SkeletonCard() {
  return (
    <div className="rounded-2xl overflow-hidden border animate-pulse" style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}>
      <div className="h-52" style={{ backgroundColor: "var(--bg-subtle)" }} />
      <div className="p-5 space-y-3">
        <div className="h-3 w-20 rounded" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-4 w-4/5 rounded" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-3 w-24 rounded" style={{ backgroundColor: "var(--bg-subtle)" }} />
        <div className="h-8 w-full rounded" style={{ backgroundColor: "var(--bg-subtle)" }} />
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithCategory }) {
  const [wished, setWished] = useState(false);
  const [added, setAdded] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <motion.article
      layout
      className="rounded-2xl overflow-hidden border flex flex-col"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -5, boxShadow: "var(--shadow-xl)" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}>

      {/* Image */}
      <div className="relative h-52 overflow-hidden" style={{ backgroundColor: "var(--bg-subtle)" }}>
        {product.image_url ? (
          <motion.div className="absolute inset-0" animate={{ scale: hovered ? 1.07 : 1 }} transition={{ duration: 0.45 }}>
            <Image src={product.image_url} alt={product.product_name} fill className="object-cover" sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 25vw" />
          </motion.div>
        ) : (
          <div className="flex items-center justify-center h-full" style={{ color: "var(--text-light)" }}>
            <Package className="w-10 h-10" />
          </div>
        )}

        {product.is_featured && (
          <span className="absolute top-3 left-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
            style={{ backgroundColor: "var(--accent)" }}>Featured</span>
        )}

        <motion.button
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center border"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)" }}
          onClick={e => { e.preventDefault(); setWished(w => !w); }}
          whileTap={{ scale: 0.8 }}
          animate={wished ? { scale: [1, 1.4, 1] } : {}}>
          <Heart className="w-4 h-4" style={{ color: wished ? "#e11d48" : "var(--text-muted)", fill: wished ? "#e11d48" : "none" }} />
        </motion.button>

        <AnimatePresence>
          {hovered && (
            <motion.div className="absolute inset-x-3 bottom-3"
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.18 }}>
              <Link href={`/products/${product.id}`}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-sm font-semibold text-white backdrop-blur-sm"
                style={{ backgroundColor: "rgba(0,0,0,0.72)" }}>
                <Eye className="w-4 h-4" />View Details
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        {product.categories && (
          <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
            {product.categories.category_name}
          </span>
        )}
        <h3 className="font-semibold mt-1.5 mb-3 line-clamp-1 leading-snug" style={{ color: "var(--text)" }}>{product.product_name}</h3>
        <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4" style={{ color: "var(--text-muted)" }}>{product.description}</p>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: "1px solid var(--border)" }}>
          {product.price != null
            ? <span className="text-lg font-black" style={{ color: "var(--text)" }}>{formatPrice(product.price)}</span>
            : <span className="text-sm italic" style={{ color: "var(--text-light)" }}>Price on request</span>
          }
          <motion.button
            onClick={() => { if (!added) { setAdded(true); setTimeout(() => setAdded(false), 2000); } }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: added ? "var(--success)" : "var(--accent)" }}
            whileTap={{ scale: 0.93 }}>
            <AnimatePresence mode="wait">
              {added
                ? <motion.span key="c" className="flex items-center gap-1" initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}><Check className="w-3.5 h-3.5" />Added</motion.span>
                : <motion.span key="s" className="flex items-center gap-1" initial={{ opacity:0, scale:0.6 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}><ShoppingCart className="w-3.5 h-3.5" />Add</motion.span>
              }
            </AnimatePresence>
          </motion.button>
        </div>
      </div>
    </motion.article>
  );
}

export default function ProductCatalogue({ initialProducts, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("name_asc");
  const [loading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (search.trim()) { const q = search.toLowerCase(); list = list.filter(p => p.product_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)); }
    if (selectedCategory !== "all") list = list.filter(p => p.category_id === selectedCategory);
    list.sort((a, b) => {
      if (sort === "name_asc")   return a.product_name.localeCompare(b.product_name);
      if (sort === "name_desc")  return b.product_name.localeCompare(a.product_name);
      if (sort === "price_asc")  return (a.price ?? Infinity) - (b.price ?? Infinity);
      if (sort === "price_desc") return (b.price ?? -Infinity) - (a.price ?? -Infinity);
      return 0;
    });
    return list;
  }, [initialProducts, search, selectedCategory, sort]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ color: "var(--text)" }}>
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>Full Range</span>
        <h1 className="font-display mt-2 text-4xl font-bold tracking-tight" style={{ color: "var(--text)" }}>Product Catalogue</h1>
        <p className="mt-2" style={{ color: "var(--text-muted)" }}>{initialProducts.length} products available</p>
      </motion.div>

      {/* Filters */}
      <motion.div className="flex flex-wrap gap-3 mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-muted)" }} />
          <input
            placeholder="Search products…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none transition-all"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
            onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
          />
        </div>

        {/* Category */}
        <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
          className="h-10 px-3.5 rounded-xl border text-sm outline-none cursor-pointer"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.category_name}</option>)}
        </select>

        {/* Sort */}
        <select value={sort} onChange={e => setSort(e.target.value as SortOption)}
          className="h-10 px-3.5 rounded-xl border text-sm outline-none cursor-pointer"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
          <option value="name_asc">Name A–Z</option>
          <option value="name_desc">Name Z–A</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>

        {(search || selectedCategory !== "all") && (
          <button onClick={() => { setSearch(""); setSelectedCategory("all"); }}
            className="h-10 w-10 rounded-xl border flex items-center justify-center transition-all"
            style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--error)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
            <X className="w-4 h-4" />
          </button>
        )}
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div className="text-center py-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ backgroundColor: "var(--bg-subtle)" }}>
            <Package className="w-9 h-9" style={{ color: "var(--text-light)" }} />
          </div>
          <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--text)" }}>No products found</h3>
          <p className="mb-5" style={{ color: "var(--text-muted)" }}>Try adjusting your search or filters</p>
          <button onClick={() => { setSearch(""); setSelectedCategory("all"); }}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}>
            Clear Filters
          </button>
        </motion.div>
      ) : (
        <motion.div layout className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

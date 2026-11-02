"use client";
import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice } from "@/lib/utils";
import type { ProductWithCategory, Category } from "@/types/database";

interface Props { initialProducts: ProductWithCategory[]; categories: Category[]; }
type SortOption = "name_asc" | "name_desc" | "price_asc" | "price_desc";

export default function ProductCatalogue({ initialProducts, categories }: Props) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sort, setSort] = useState<SortOption>("name_asc");

  const filtered = useMemo(() => {
    let list = [...initialProducts];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.product_name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (selectedCategory !== "all") list = list.filter(p => p.category_id === selectedCategory);
    list.sort((a, b) => {
      switch (sort) {
        case "name_asc": return a.product_name.localeCompare(b.product_name);
        case "name_desc": return b.product_name.localeCompare(a.product_name);
        case "price_asc": return (a.price ?? Infinity) - (b.price ?? Infinity);
        case "price_desc": return (b.price ?? -Infinity) - (a.price ?? -Infinity);
        default: return 0;
      }
    });
    return list;
  }, [initialProducts, search, selectedCategory, sort]);

  const hasFilters = search.trim() !== "" || selectedCategory !== "all";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Product Catalogue</h1>
        <p className="mt-2 text-slate-500">{initialProducts.length} products available</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)} className="pl-9" aria-label="Search products" />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]" aria-label="Filter by category">
            <SlidersHorizontal className="w-4 h-4 mr-2 text-slate-400" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sort} onValueChange={v => setSort(v as SortOption)}>
          <SelectTrigger className="w-full sm:w-[180px]" aria-label="Sort products">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name_asc">Name A–Z</SelectItem>
            <SelectItem value="name_desc">Name Z–A</SelectItem>
            <SelectItem value="price_asc">Price: Low to High</SelectItem>
            <SelectItem value="price_desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setSelectedCategory("all"); }} aria-label="Clear filters">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {search.trim() && (
            <Badge variant="secondary" className="gap-1">
              Search: "{search}"
              <button onClick={() => setSearch("")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          {selectedCategory !== "all" && (
            <Badge variant="secondary" className="gap-1">
              {categories.find(c => c.id === selectedCategory)?.category_name}
              <button onClick={() => setSelectedCategory("all")}><X className="w-3 h-3" /></button>
            </Badge>
          )}
          <Badge variant="outline">{filtered.length} results</Badge>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-xl font-medium text-slate-500">No products found.</p>
          <Button variant="link" onClick={() => { setSearch(""); setSelectedCategory("all"); }} className="mt-2">Clear all filters</Button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map(product => <ProductCard key={product.id} product={product} />)}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: ProductWithCategory }) {
  return (
    <article className="group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        {product.image_url ? (
          <Image src={product.image_url} alt={product.product_name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-sm">No image</div>
        )}
        {product.is_featured && (
          <div className="absolute top-3 left-3"><Badge className="text-xs">Featured</Badge></div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        {product.categories && <Badge variant="secondary" className="text-xs w-fit mb-2">{product.categories.category_name}</Badge>}
        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1">{product.product_name}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 flex-1">{product.description}</p>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
          {product.price != null
            ? <span className="font-bold text-blue-600">{formatPrice(product.price)}</span>
            : <span className="text-sm text-slate-400">Price on request</span>
          }
          <Button size="sm" asChild><Link href={`/products/${product.id}`}>View Details</Link></Button>
        </div>
      </div>
    </article>
  );
}

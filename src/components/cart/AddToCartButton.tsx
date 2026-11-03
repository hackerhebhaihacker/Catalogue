"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Check, Mail } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";
import type { CartItem } from "@/lib/cart-context";

interface Props {
  product: Omit<CartItem, "quantity">;
}

export default function AddToCartButton({ product }: Props) {
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const { toast } = useToast();

  const handleAdd = () => {
    if (added) return;
    add(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
    toast({ title: "Added to cart!", description: product.product_name });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Add to Cart */}
      <motion.button
        onClick={handleAdd}
        className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl text-base font-semibold text-white transition-all"
        style={{ backgroundColor: added ? "var(--success)" : "var(--accent)" }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Add to cart">
        <AnimatePresence mode="wait">
          {added ? (
            <motion.span key="done" className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <Check className="w-5 h-5" />Added to Cart!
            </motion.span>
          ) : (
            <motion.span key="add" className="flex items-center gap-2"
              initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
              <ShoppingCart className="w-5 h-5" />Add to Cart
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Direct enquiry */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        <a
          href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@nexuscommerce.com"}?subject=${encodeURIComponent(`Enquiry: ${product.product_name}`)}&body=${encodeURIComponent(`Hello,\n\nI am interested in "${product.product_name}". Please provide availability, pricing and delivery details.\n\nThank you.`)}`}
          className="flex items-center justify-center gap-2 h-12 px-6 rounded-xl text-sm font-medium border transition-all"
          style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
          <Mail className="w-4 h-4" />Enquire
        </a>
      </motion.div>

      {/* Browse more */}
      <Link href="/products"
        className="flex items-center justify-center h-12 px-6 rounded-xl text-sm font-medium border transition-all"
        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}>
        Browse More
      </Link>
    </div>
  );
}

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Trash2, ShoppingCart,
  Package, ArrowRight, ShieldCheck, RotateCcw,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, remove, update, clear } = useCart();

  // Build enquiry email
  const buildEmail = () => {
    const lines = items
      .map(i => `• ${i.product_name} (Qty: ${i.quantity})${i.price ? ` — ${formatPrice(i.price * i.quantity)}` : ""}`)
      .join("%0A");
    const subject = encodeURIComponent(`Product Enquiry — ${count} item${count > 1 ? "s" : ""}`);
    const body = `Hello%2C%0A%0AI am interested in the following products%3A%0A%0A${lines}%0A%0APlease provide availability%2C delivery details and any bulk pricing.%0A%0AThank you.`;
    return `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col w-full max-w-md"
            style={{ backgroundColor: "var(--bg-card)", boxShadow: "var(--shadow-xl)" }}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent-light)" }}>
                  <ShoppingCart className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight" style={{ color: "var(--text)" }}>Your Cart</h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Empty"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={clear}
                    className="text-xs px-2.5 py-1 rounded-lg border transition-all"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--error)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                    Clear all
                  </button>
                )}
                <button
                  onClick={closeCart}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
                  aria-label="Close cart">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "var(--bg-subtle)" }}>
                    <ShoppingCart className="w-9 h-9" style={{ color: "var(--text-light)" }} />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Your cart is empty</h3>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>Add products to your cart to send an enquiry.</p>
                  </div>
                  <button
                    onClick={closeCart}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--accent)" }}>
                    Browse Products
                  </button>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: "auto", y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                        {/* Image */}
                        <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0"
                          style={{ backgroundColor: "var(--bg-subtle)" }}>
                          {item.image_url ? (
                            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="80px" />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="w-6 h-6" style={{ color: "var(--text-light)" }} />
                            </div>
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--accent)" }}>
                            {item.category}
                          </p>
                          <p className="font-semibold text-sm leading-tight line-clamp-2" style={{ color: "var(--text)" }}>
                            {item.product_name}
                          </p>
                          <p className="text-sm font-bold mt-1" style={{ color: "var(--text)" }}>
                            {item.price != null ? formatPrice(item.price) : "Price on request"}
                          </p>

                          {/* Qty controls */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-1 rounded-xl border overflow-hidden"
                              style={{ borderColor: "var(--border)" }}>
                              <button
                                onClick={() => update(item.id, item.quantity - 1)}
                                className="w-8 h-8 flex items-center justify-center transition-all"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                aria-label="Decrease quantity">
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--text)" }}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => update(item.id, item.quantity + 1)}
                                className="w-8 h-8 flex items-center justify-center transition-all"
                                style={{ color: "var(--text-muted)" }}
                                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                                aria-label="Increase quantity">
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Item subtotal */}
                            <div className="flex items-center gap-3">
                              {item.price != null && (
                                <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                                  {formatPrice(item.price * item.quantity)}
                                </span>
                              )}
                              <button
                                onClick={() => remove(item.id)}
                                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                style={{ color: "var(--text-light)" }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-light)"; }}
                                aria-label="Remove item">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer — subtotal + actions */}
            {items.length > 0 && (
              <div className="px-6 py-5" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                {/* Subtotal */}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Subtotal ({count} item{count > 1 ? "s" : ""})
                  </span>
                  <span className="text-xl font-black" style={{ color: "var(--text)" }}>
                    {subtotal > 0 ? formatPrice(subtotal) : "—"}
                  </span>
                </div>

                <p className="text-xs mb-5 text-center" style={{ color: "var(--text-muted)" }}>
                  This is a product catalogue. Click below to send an enquiry email with your selected items.
                </p>

                {/* Primary CTA — sends enquiry email */}
                <motion.a
                  href={buildEmail()}
                  className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-base font-semibold text-white mb-3"
                  style={{ backgroundColor: "var(--accent)" }}
                  whileHover={{ backgroundColor: "var(--accent-dark)" }}
                  whileTap={{ scale: 0.98 }}>
                  Send Enquiry for {count} Item{count > 1 ? "s" : ""}
                  <ArrowRight className="w-4 h-4" />
                </motion.a>

                {/* Browse more */}
                <Link href="/products"
                  onClick={closeCart}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-medium border transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                  Continue Browsing
                </Link>

                {/* Trust badges */}
                <div className="flex items-center justify-center gap-6 mt-4 pt-4"
                  style={{ borderTop: "1px solid var(--border)" }}>
                  {[
                    { icon: ShieldCheck, label: "Secure" },
                    { icon: RotateCcw,   label: "Easy Returns" },
                  ].map(({ icon: Icon, label }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-light)" }}>
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

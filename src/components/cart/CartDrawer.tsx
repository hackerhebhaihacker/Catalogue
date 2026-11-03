"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Plus, Minus, Trash2, ShoppingCart,
  Package, ShieldCheck, RotateCcw,
  CheckCircle2, Loader2, AlertCircle,
} from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";

type CheckoutState = "idle" | "loading" | "success" | "error";

export default function CartDrawer() {
  const { items, count, subtotal, isOpen, closeCart, remove, update, clear } = useCart();
  const [notes, setNotes]             = useState("");
  const [checkoutState, setCheckout]  = useState<CheckoutState>("idle");
  const [orderNumber, setOrderNumber] = useState("");
  const [errorMsg, setErrorMsg]       = useState("");

  const handlePlaceOrder = async () => {
    if (items.length === 0 || checkoutState === "loading") return;
    setCheckout("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/orders", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map(i => ({
            id:           i.id,
            product_name: i.product_name,
            category:     i.category,
            price:        i.price,
            quantity:     i.quantity,
          })),
          notes: notes.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setCheckout("error");
        return;
      }

      setOrderNumber(json.orderNumber);
      setCheckout("success");
      clear();
      setNotes("");
    } catch {
      setErrorMsg("Network error. Please check your connection.");
      setCheckout("error");
    }
  };

  const handleClose = () => {
    closeCart();
    // Reset to idle after drawer closes
    setTimeout(() => { setCheckout("idle"); setOrderNumber(""); setErrorMsg(""); }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50"
            style={{ backgroundColor: "rgba(0,0,0,0.48)", backdropFilter: "blur(3px)" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
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
            {/* ── Header ── */}
            <div className="flex items-center justify-between px-6 py-5 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--accent-light)" }}>
                  <ShoppingCart className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg leading-tight" style={{ color: "var(--text)" }}>
                    {checkoutState === "success" ? "Order Placed!" : "Your Cart"}
                  </h2>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {checkoutState === "success"
                      ? `Order ${orderNumber}`
                      : count > 0 ? `${count} item${count > 1 ? "s" : ""}` : "Empty"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && checkoutState === "idle" && (
                  <button onClick={clear} className="text-xs px-2.5 py-1 rounded-lg border transition-all"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--error)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                    Clear all
                  </button>
                )}
                <button onClick={handleClose}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                  aria-label="Close cart">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── SUCCESS STATE ── */}
            {checkoutState === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-5">
                <motion.div
                  className="w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(22,163,74,0.1)" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                  <CheckCircle2 className="w-12 h-12" style={{ color: "var(--success)" }} />
                </motion.div>
                <div>
                  <h3 className="text-2xl font-black mb-2" style={{ color: "var(--text)" }}>Order Placed!</h3>
                  <p className="text-lg font-bold mb-1" style={{ color: "var(--accent)" }}>{orderNumber}</p>
                  <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    Your order has been received. We&apos;ve sent a confirmation to your email. Our team will contact you within 24 hours.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full">
                  <Link href="/dashboard"
                    onClick={handleClose}
                    className="flex items-center justify-center h-11 rounded-xl text-sm font-semibold text-white"
                    style={{ backgroundColor: "var(--accent)" }}>
                    Track My Order
                  </Link>
                  <button onClick={handleClose}
                    className="h-11 rounded-xl text-sm font-medium border transition-all"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}

            {/* ── CART ITEMS ── */}
            {checkoutState !== "success" && (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-16">
                      <div className="w-20 h-20 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--bg-subtle)" }}>
                        <ShoppingCart className="w-9 h-9" style={{ color: "var(--text-light)" }} />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-1" style={{ color: "var(--text)" }}>Your cart is empty</h3>
                        <p className="text-sm" style={{ color: "var(--text-muted)" }}>Browse our catalogue and add products.</p>
                      </div>
                      <Link href="/products" onClick={handleClose}
                        className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
                        style={{ backgroundColor: "var(--accent)" }}>
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <AnimatePresence initial={false}>
                      {items.map(item => (
                        <motion.div key={item.id} layout
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden">
                          <div className="flex gap-4 py-4" style={{ borderBottom: "1px solid var(--border)" }}>
                            {/* Thumbnail */}
                            <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0"
                              style={{ backgroundColor: "var(--bg-subtle)" }}>
                              {item.image_url
                                ? <Image src={item.image_url} alt={item.product_name} fill className="object-cover" sizes="80px" />
                                : <div className="flex items-center justify-center h-full"><Package className="w-6 h-6" style={{ color: "var(--text-light)" }} /></div>
                              }
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--accent)" }}>
                                {item.category}
                              </p>
                              <p className="font-semibold text-sm leading-tight line-clamp-2 mb-1" style={{ color: "var(--text)" }}>
                                {item.product_name}
                              </p>
                              <p className="text-sm font-bold" style={{ color: "var(--text)" }}>
                                {item.price != null ? formatPrice(item.price) : "Price on request"}
                              </p>
                              {/* Qty + remove */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-0 rounded-xl border overflow-hidden"
                                  style={{ borderColor: "var(--border)" }}>
                                  <button onClick={() => update(item.id, item.quantity - 1)}
                                    className="w-8 h-8 flex items-center justify-center transition-all"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    aria-label="Decrease">
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-semibold" style={{ color: "var(--text)" }}>
                                    {item.quantity}
                                  </span>
                                  <button onClick={() => update(item.id, item.quantity + 1)}
                                    className="w-8 h-8 flex items-center justify-center transition-all"
                                    style={{ color: "var(--text-muted)" }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"}
                                    aria-label="Increase">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                                <div className="flex items-center gap-3">
                                  {item.price != null && (
                                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                                      {formatPrice(item.price * item.quantity)}
                                    </span>
                                  )}
                                  <button onClick={() => remove(item.id)}
                                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                                    style={{ color: "var(--text-light)" }}
                                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
                                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-light)"; }}
                                    aria-label="Remove">
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}

                      {/* Notes */}
                      {items.length > 0 && (
                        <div className="pt-4">
                          <label htmlFor="order-notes" className="block text-sm font-medium mb-1.5"
                            style={{ color: "var(--text)" }}>
                            Notes for order <span style={{ color: "var(--text-muted)" }}>(optional)</span>
                          </label>
                          <textarea id="order-notes" rows={3}
                            placeholder="Special requests, delivery instructions…"
                            value={notes} onChange={e => setNotes(e.target.value)}
                            className="w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none outline-none transition-all"
                            style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                            onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                            onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                        </div>
                      )}
                    </AnimatePresence>
                  )}
                </div>

                {/* ── Footer ── */}
                {items.length > 0 && (
                  <div className="px-6 py-5 shrink-0"
                    style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg)" }}>
                    {/* Subtotal */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                        Subtotal ({count} item{count > 1 ? "s" : ""})
                      </span>
                      <span className="text-xl font-black" style={{ color: "var(--text)" }}>
                        {subtotal > 0 ? formatPrice(subtotal) : "—"}
                      </span>
                    </div>

                    {/* Error */}
                    {checkoutState === "error" && (
                      <motion.div
                        className="flex items-start gap-2.5 p-3.5 rounded-xl mb-4 text-sm"
                        style={{ backgroundColor: "rgba(220,38,38,0.07)", border: "1px solid rgba(220,38,38,0.2)", color: "var(--error)" }}
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{errorMsg || "Something went wrong. Please try again."}</span>
                      </motion.div>
                    )}

                    {/* Place Order CTA */}
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={checkoutState === "loading"}
                      className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl text-base font-semibold text-white mb-3 transition-all"
                      style={{ backgroundColor: checkoutState === "loading" ? "var(--text-muted)" : "var(--accent)" }}
                      whileHover={checkoutState === "idle" ? { scale: 1.01 } : {}}
                      whileTap={checkoutState === "idle" ? { scale: 0.98 } : {}}>
                      {checkoutState === "loading"
                        ? <><Loader2 className="w-5 h-5 animate-spin" />Placing Order…</>
                        : <>Place Order · {count} Item{count > 1 ? "s" : ""}</>
                      }
                    </motion.button>

                    {/* Continue browsing */}
                    <Link href="/products" onClick={handleClose}
                      className="flex items-center justify-center w-full py-3 rounded-xl text-sm font-medium border transition-all"
                      style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                      Continue Shopping
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
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

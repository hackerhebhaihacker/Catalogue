"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, Calendar, ShoppingBag,
  Settings, Shield, ShoppingCart, Package,
  Clock, CheckCircle2, Truck, XCircle, ChevronDown, ChevronRight,
} from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import type { Profile, OrderWithItems, OrderStatus } from "@/types/database";
import { siteConfig } from "@/lib/site-config";

interface Props { profile: Profile | null; }

/* ── Status config ── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "#92400e", bg: "#fef3c7", icon: Clock        },
  confirmed:  { label: "Confirmed",  color: "#1e40af", bg: "#dbeafe", icon: CheckCircle2  },
  processing: { label: "Processing", color: "#6b21a8", bg: "#f3e8ff", icon: Package       },
  dispatched: { label: "Dispatched", color: "#065f46", bg: "#d1fae5", icon: Truck         },
  delivered:  { label: "Delivered",  color: "#166534", bg: "#dcfce7", icon: CheckCircle2  },
  cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2", icon: XCircle       },
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  );
}

export default function UserDashboard({ profile }: Props) {
  const [orders, setOrders]             = useState<OrderWithItems[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  /* Fetch customer's own orders */
  useEffect(() => {
    fetch("/api/orders")
      .then(r => r.json())
      .then(json => setOrders(json.data ?? []))
      .catch(() => setOrders([]))
      .finally(() => setLoadingOrders(false));
  }, []);

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--bg-subtle)" }}>
          <User className="w-8 h-8" style={{ color: "var(--text-light)" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Profile Not Found</h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Please sign out and sign back in. If the issue persists, contact support.
        </p>
        <Link href="/" className="inline-flex px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}>Go Home</Link>
      </div>
    );
  }

  const actions = [
    { icon: ShoppingBag, title: "Browse Catalogue", desc: "Explore all products", href: "/products",  bg: "rgba(79,70,229,0.08)",  c: "var(--accent)" },
    { icon: Mail,        title: "Contact Us",        desc: "Get in touch",         href: "/#contact",  bg: "rgba(5,150,105,0.08)",  c: "#059669"       },
    { icon: ShoppingCart,title: "My Orders",         desc: `${orders.length} order${orders.length !== 1 ? "s" : ""}`, href: "#orders", bg: "rgba(217,119,6,0.08)", c: "#d97706" },
    ...(profile.role === "admin" ? [
      { icon: Settings, title: "Admin Dashboard", desc: "Manage products", href: "/admin", bg: "rgba(124,58,237,0.08)", c: "#7c3aed" }
    ] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

      {/* Header */}
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>My Account</span>
        <h1 className="font-display mt-2 text-3xl font-bold" style={{ color: "var(--text)" }}>
          Welcome back, {profile.full_name.split(" ")[0]}!
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Manage your account and track your orders.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">

        {/* ── Profile card ── */}
        <motion.div className="lg:col-span-1 rounded-2xl border p-8 text-center"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--accent-light)" }}>
            <User className="w-10 h-10" style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{profile.full_name}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: profile.role === "admin" ? "var(--accent-light)" : "var(--bg-subtle)",
              color:           profile.role === "admin" ? "var(--accent)"       : "var(--text-muted)",
            }}>
            {profile.role === "admin" && <Shield className="w-3 h-3" />}
            {profile.role === "admin" ? "Administrator" : "Customer"}
          </span>

          <div className="mt-6 space-y-4 text-sm text-left">
            {[
              { icon: Mail,     val: profile.email },
              ...(profile.mobile_number ? [{ icon: Phone, val: profile.mobile_number }] : []),
              { icon: Calendar, val: `Joined ${formatDate(profile.created_at)}` },
            ].map(({ icon: Icon, val }) => (
              <div key={val} className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <span className="truncate text-sm" style={{ color: "var(--text-muted)" }}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick actions */}
          <motion.div className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <h3 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {actions.map(a => (
                <motion.div key={a.title} whileHover={{ y: -2 }} transition={{ duration: 0.15 }}>
                  <Link href={a.href}
                    className="flex items-start gap-4 p-4 rounded-2xl border transition-all"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = a.c)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                    <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: a.bg }}>
                      <a.icon className="w-5 h-5" style={{ color: a.c }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{a.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Account details */}
          <motion.div className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Account Details</h3>
            <dl className="text-sm">
              {[
                { label: "Full Name",      value: profile.full_name },
                { label: "Email",          value: profile.email },
                { label: "Mobile",         value: profile.mobile_number ?? "Not provided" },
                { label: "Role",           value: profile.role === "admin" ? "Administrator" : "Customer" },
                { label: "Member Since",   value: formatDate(profile.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3"
                  style={{ borderBottom: "1px solid var(--border)" }}>
                  <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd className="font-medium" style={{ color: "var(--text)" }}>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs mt-4" style={{ color: "var(--text-light)" }}>
              To update your details, contact{" "}
              <a href={`mailto:${siteConfig.email}`} className="link-underline" style={{ color: "var(--accent)" }}>
                {siteConfig.email}
              </a>
            </p>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          MY ORDERS SECTION
      ══════════════════════════════════════════════════════════════ */}
      <motion.div id="orders" className="mt-10 rounded-2xl border overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>

        <div className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(79,70,229,0.08)" }}>
              <ShoppingCart className="w-5 h-5" style={{ color: "var(--accent)" }} />
            </div>
            <div>
              <h3 className="font-bold" style={{ color: "var(--text)" }}>My Orders</h3>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                {loadingOrders ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
              </p>
            </div>
          </div>
          <Link href="/products"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{ backgroundColor: "var(--accent)" }}>
            <ShoppingBag className="w-4 h-4" />Browse More
          </Link>
        </div>

        {loadingOrders ? (
          <div className="py-12 text-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
              style={{ borderColor: "var(--accent)" }} />
            <p className="text-sm mt-3" style={{ color: "var(--text-muted)" }}>Loading your orders…</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center px-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "var(--bg-subtle)" }}>
              <ShoppingCart className="w-7 h-7" style={{ color: "var(--text-light)" }} />
            </div>
            <h4 className="font-semibold mb-2" style={{ color: "var(--text)" }}>No orders yet</h4>
            <p className="text-sm mb-5" style={{ color: "var(--text-muted)" }}>
              Browse our catalogue, add items to your cart and place an order.
            </p>
            <Link href="/products"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              <ShoppingBag className="w-4 h-4" />Browse Products
            </Link>
          </div>
        ) : (
          <div>
            {orders.map((order, idx) => (
              <div key={order.id} style={{ borderTop: idx > 0 ? "1px solid var(--border)" : "none" }}>
                {/* Order header row */}
                <button
                  className="w-full flex items-start sm:items-center justify-between gap-4 px-6 py-5 text-left transition-all"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="mt-0.5 shrink-0">
                      {expandedOrder === order.id
                        ? <ChevronDown className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                        : <ChevronRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-bold text-sm" style={{ color: "var(--accent)" }}>
                          {order.order_number}
                        </span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                        {" · "}{order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <span className="text-lg font-black shrink-0" style={{ color: "var(--text)" }}>
                    {order.subtotal > 0 ? formatPrice(order.subtotal) : "—"}
                  </span>
                </button>

                {/* Expanded order items */}
                {expandedOrder === order.id && (
                  <div className="px-6 pb-5 space-y-4" style={{ borderTop: "1px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                    {/* Status timeline */}
                    <div className="flex flex-wrap gap-2 pt-4">
                      {(["pending","confirmed","processing","dispatched","delivered"] as OrderStatus[]).map(s => {
                        const cfg = STATUS_CONFIG[s];
                        const isActive = order.status === s;
                        const isPast = (["pending","confirmed","processing","dispatched","delivered"] as OrderStatus[])
                          .indexOf(s) <= (["pending","confirmed","processing","dispatched","delivered"] as OrderStatus[]).indexOf(order.status as OrderStatus) && order.status !== "cancelled";
                        return (
                          <div key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: isActive ? cfg.bg : isPast ? cfg.bg + "80" : "var(--bg-card)",
                              color:           isActive ? cfg.color : isPast ? cfg.color + "99" : "var(--text-light)",
                              border:          `1px solid ${isActive ? cfg.color + "40" : "var(--border)"}`,
                              fontWeight:      isActive ? 700 : 500,
                            }}>
                            <cfg.icon className="w-3 h-3" />
                            {cfg.label}
                          </div>
                        );
                      })}
                      {order.status === "cancelled" && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                          style={{ backgroundColor: "#fee2e2", color: "#991b1b", border: "1px solid #fca5a5" }}>
                          <XCircle className="w-3 h-3" />Cancelled
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--border)" }}>
                      <table className="w-full text-sm">
                        <thead>
                          <tr style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                            <th className="text-left py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Product</th>
                            <th className="text-center py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Qty</th>
                            <th className="text-right py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody style={{ backgroundColor: "var(--bg-card)" }}>
                          {order.order_items.map((item, i) => (
                            <tr key={item.id} style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                              <td className="py-2.5 px-4">
                                <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{item.product_name}</p>
                                {item.category && (
                                  <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{item.category}</p>
                                )}
                              </td>
                              <td className="py-2.5 px-4 text-center text-sm font-semibold" style={{ color: "var(--text)" }}>
                                {item.quantity}
                              </td>
                              <td className="py-2.5 px-4 text-right text-sm font-semibold" style={{ color: "var(--text)" }}>
                                {item.price != null ? formatPrice(item.price * item.quantity) : "On request"}
                              </td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: "2px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                            <td colSpan={2} className="py-3 px-4 text-right text-sm font-bold" style={{ color: "var(--text-muted)" }}>
                              Total
                            </td>
                            <td className="py-3 px-4 text-right text-base font-black" style={{ color: "var(--text)" }}>
                              {order.subtotal > 0 ? formatPrice(order.subtotal) : "—"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                      <div className="rounded-xl p-4 text-sm"
                        style={{ backgroundColor: "#fefce8", border: "1px solid #fde68a", color: "#78350f" }}>
                        <strong>Your note:</strong> {order.notes}
                      </div>
                    )}

                    {/* What to expect */}
                    {order.status === "pending" && (
                      <div className="rounded-xl p-4 text-sm"
                        style={{ backgroundColor: "var(--accent-light)", border: "1px solid rgba(79,70,229,0.15)", color: "var(--accent)" }}>
                        Our team will review your order and contact you within <strong>24 hours</strong> to confirm availability and arrange delivery.
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import {
  LayoutDashboard, Package, FolderOpen, Users,
  Plus, Pencil, Trash2, BarChart3, AlertTriangle,
  Loader2, ShoppingBag, ChevronDown, ChevronRight,
  Clock, CheckCircle2, Truck, XCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type {
  ProductWithCategory, Category, Profile,
  OrderWithItems, OrderStatus,
} from "@/types/database";

/* ─────────────────────────────────────────────────────────────────────────────
   TYPES
───────────────────────────────────────────────────────────────────────────── */
interface Stats {
  totalProducts:    number;
  totalUsers:       number;
  activeProducts:   number;
  featuredProducts: number;
  totalOrders:      number;
  pendingOrders:    number;
}

interface Props {
  initialProducts: ProductWithCategory[];
  categories:      Category[];
  users:           Profile[];
  initialOrders:   OrderWithItems[];
  stats:           Stats;
}

type Tab = "overview" | "orders" | "products" | "categories" | "users";

interface ProductFormData {
  product_name: string;
  description:  string;
  category_id:  string;
  image_url:    string;
  price:        string;
  is_featured:  boolean;
  is_active:    boolean;
}

const emptyProduct: ProductFormData = {
  product_name: "", description: "", category_id: "",
  image_url: "", price: "", is_featured: false, is_active: true,
};

/* ─────────────────────────────────────────────────────────────────────────────
   ORDER STATUS HELPERS
───────────────────────────────────────────────────────────────────────────── */
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pending:    { label: "Pending",    color: "#92400e", bg: "#fef3c7", icon: Clock        },
  confirmed:  { label: "Confirmed",  color: "#1e40af", bg: "#dbeafe", icon: CheckCircle2  },
  processing: { label: "Processing", color: "#6b21a8", bg: "#f3e8ff", icon: BarChart3     },
  dispatched: { label: "Dispatched", color: "#065f46", bg: "#d1fae5", icon: Truck         },
  delivered:  { label: "Delivered",  color: "#166534", bg: "#dcfce7", icon: CheckCircle2  },
  cancelled:  { label: "Cancelled",  color: "#991b1b", bg: "#fee2e2", icon: XCircle       },
};

const ALL_STATUSES: OrderStatus[] = ["pending","confirmed","processing","dispatched","delivered","cancelled"];

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

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────────────────────── */
export default function AdminDashboard({
  initialProducts, categories, users, initialOrders, stats,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  /* Products state */
  const [products, setProducts] = useState(initialProducts);
  const [productModal, setProductModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>(
    { open: false, id: "", name: "" }
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData]   = useState<ProductFormData>(emptyProduct);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState(false);

  /* Categories state */
  const [catModal, setCatModal]   = useState(false);
  const [catList, setCatList]     = useState(categories);
  const [catForm, setCatForm]     = useState({ category_name: "", description: "" });
  const [savingCat, setSavingCat] = useState(false);

  /* Orders state */
  const [orders, setOrders]               = useState(initialOrders);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [orderSearch, setOrderSearch]     = useState("");
  const [orderFilter, setOrderFilter]     = useState<OrderStatus | "all">("all");

  const { toast } = useToast();

  /* ── Product CRUD ── */
  const openCreate = () => { setEditingId(null); setFormData(emptyProduct); setProductModal(true); };
  const openEdit = (p: ProductWithCategory) => {
    setEditingId(p.id);
    setFormData({
      product_name: p.product_name, description: p.description,
      category_id: p.category_id ?? "", image_url: p.image_url ?? "",
      price: p.price != null ? String(p.price) : "",
      is_featured: p.is_featured, is_active: p.is_active,
    });
    setProductModal(true);
  };

  const saveProduct = async () => {
    if (!formData.product_name.trim() || !formData.description.trim()) {
      toast({ title: "Name and description are required.", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const payload = {
        product_name: formData.product_name.trim(),
        description:  formData.description.trim(),
        category_id:  formData.category_id || null,
        image_url:    formData.image_url.trim() || null,
        price:        formData.price ? parseFloat(formData.price) : null,
        is_featured:  formData.is_featured,
        is_active:    formData.is_active,
      };
      const url    = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Failed"); }
      const { data: saved } = await res.json();
      const withCat = { ...saved, categories: catList.find(c => c.id === saved.category_id) ?? null } as ProductWithCategory;
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? withCat : p));
        toast({ title: "Product updated." });
      } else {
        setProducts(prev => [withCat, ...prev]);
        toast({ title: "Product created." });
      }
      setProductModal(false);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown", variant: "destructive" });
    } finally { setSaving(false); }
  };

  const deleteProduct = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteModal.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setProducts(prev => prev.filter(p => p.id !== deleteModal.id));
      setDeleteModal({ open: false, id: "", name: "" });
      toast({ title: "Product deleted." });
    } catch { toast({ title: "Could not delete product.", variant: "destructive" }); }
    finally { setDeleting(false); }
  };

  /* ── Category CRUD ── */
  const saveCategory = async () => {
    if (!catForm.category_name.trim()) { toast({ title: "Name required.", variant: "destructive" }); return; }
    setSavingCat(true);
    try {
      const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
      if (!res.ok) throw new Error("Failed");
      const { data } = await res.json();
      setCatList(prev => [...prev, data]);
      setCatForm({ category_name: "", description: "" });
      setCatModal(false);
      toast({ title: "Category created." });
    } catch { toast({ title: "Error creating category.", variant: "destructive" }); }
    finally { setSavingCat(false); }
  };

  /* ── Order status update ── */
  const updateOrderStatus = async (orderId: string, status: OrderStatus, adminNotes?: string) => {
    setUpdatingOrder(orderId);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...(adminNotes !== undefined ? { admin_notes: adminNotes } : {}) }),
      });
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? "Failed"); }
      const { data } = await res.json();
      setOrders(prev => prev.map(o => o.id === orderId ? data : o));
      toast({ title: `Order ${STATUS_CONFIG[status].label}`, description: `Status updated to ${STATUS_CONFIG[status].label}` });
    } catch (err: unknown) {
      toast({ title: "Failed to update order", description: err instanceof Error ? err.message : "Unknown", variant: "destructive" });
    } finally { setUpdatingOrder(null); }
  };

  /* ── Filtered orders ── */
  const filteredOrders = orders.filter(o => {
    const matchSearch = orderSearch === "" ||
      o.order_number.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_name.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer_email.toLowerCase().includes(orderSearch.toLowerCase());
    const matchStatus = orderFilter === "all" || o.status === orderFilter;
    return matchSearch && matchStatus;
  });

  /* ── Tabs config ── */
  const tabs: { id: Tab; label: string; icon: React.ElementType; badge?: number }[] = [
    { id: "overview",    label: "Overview",    icon: LayoutDashboard },
    { id: "orders",      label: "Orders",      icon: ShoppingBag,    badge: stats.pendingOrders },
    { id: "products",    label: "Products",    icon: Package         },
    { id: "categories",  label: "Categories",  icon: FolderOpen      },
    { id: "users",       label: "Users",       icon: Users           },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Page header ── */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold" style={{ color: "var(--text)" }}>Admin Dashboard</h1>
        <p className="mt-1" style={{ color: "var(--text-muted)" }}>Manage orders, products, categories and users</p>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 rounded-xl mb-8 w-fit overflow-x-auto"
        style={{ backgroundColor: "var(--bg-subtle)" }}>
        {tabs.map(({ id, label, icon: Icon, badge }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            style={{
              backgroundColor: activeTab === id ? "var(--bg-card)" : "transparent",
              color:           activeTab === id ? "var(--text)"      : "var(--text-muted)",
              boxShadow:       activeTab === id ? "var(--shadow-sm)"  : "none",
            }}>
            <Icon className="w-4 h-4" />
            {label}
            {badge != null && badge > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                style={{ backgroundColor: "#dc2626" }}>
                {badge > 9 ? "9+" : badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════
          OVERVIEW TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {[
              { label: "Total Orders",    value: stats.totalOrders,      icon: ShoppingBag, bg: "rgba(79,70,229,0.08)",  c: "#4f46e5" },
              { label: "Pending Orders",  value: stats.pendingOrders,    icon: Clock,       bg: "rgba(217,119,6,0.08)",  c: "#d97706" },
              { label: "Total Products",  value: stats.totalProducts,    icon: Package,     bg: "rgba(79,70,229,0.08)",  c: "#4f46e5" },
              { label: "Active Products", value: stats.activeProducts,   icon: BarChart3,   bg: "rgba(22,163,74,0.08)",  c: "#16a34a" },
              { label: "Featured",        value: stats.featuredProducts, icon: Package,     bg: "rgba(217,119,6,0.08)",  c: "#d97706" },
              { label: "Users",           value: stats.totalUsers,       icon: Users,       bg: "rgba(124,58,237,0.08)", c: "#7c3aed" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-5 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: s.bg }}>
                    <s.icon className="w-5 h-5" style={{ color: s.c }} />
                  </div>
                  <div>
                    <p className="text-xl font-black" style={{ color: "var(--text)" }}>{s.value}</p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Orders</CardTitle>
              <button onClick={() => setActiveTab("orders")}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--accent)" }}>
                View All →
              </button>
            </CardHeader>
            <CardContent className="p-0">
              {orders.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                  No orders yet. When customers place orders they will appear here.
                </p>
              ) : (
                <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                  {orders.slice(0, 6).map(o => (
                    <div key={o.id} className="flex items-center justify-between px-6 py-3.5">
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "var(--accent)" }}>{o.order_number}</p>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {o.customer_name} · {new Date(o.created_at).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={o.status} />
                        <span className="text-sm font-bold" style={{ color: "var(--text)" }}>
                          {o.subtotal > 0 ? formatPrice(o.subtotal) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Recent Products</CardTitle>
              <button onClick={() => setActiveTab("products")}
                className="text-sm font-medium" style={{ color: "var(--accent)" }}>
                View All →
              </button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y" style={{ borderColor: "var(--border)" }}>
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between px-6 py-3.5">
                    <div>
                      <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{p.product_name}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                        {p.categories?.category_name ?? "Uncategorised"}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                      {p.price != null && <span className="text-sm font-medium" style={{ color: "var(--text)" }}>{formatPrice(p.price)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          ORDERS TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
              Orders ({filteredOrders.length})
              {stats.pendingOrders > 0 && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold text-white"
                  style={{ backgroundColor: "#dc2626" }}>
                  {stats.pendingOrders} pending
                </span>
              )}
            </h2>
            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <input
                placeholder="Search by order #, name, email…"
                value={orderSearch}
                onChange={e => setOrderSearch(e.target.value)}
                className="h-9 px-3.5 rounded-xl border text-sm outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)", minWidth: "220px" }}
                onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
              />
              {/* Status filter */}
              <select
                value={orderFilter}
                onChange={e => setOrderFilter(e.target.value as OrderStatus | "all")}
                className="h-9 px-3 rounded-xl border text-sm outline-none"
                style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
                <option value="all">All Statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                ))}
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <ShoppingBag className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--text-light)" }} />
                <p className="font-medium" style={{ color: "var(--text)" }}>
                  {orders.length === 0 ? "No orders yet" : "No orders match your filters"}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
                  {orders.length === 0
                    ? "When customers place orders they'll appear here."
                    : "Try changing your search or status filter."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredOrders.map(order => (
                <Card key={order.id} className="overflow-hidden">
                  {/* Order row */}
                  <div
                    className="flex items-start sm:items-center justify-between gap-4 p-5 cursor-pointer"
                    style={{ borderBottom: expandedOrder === order.id ? "1px solid var(--border)" : "none" }}
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}>
                    {/* Left: order info */}
                    <div className="flex items-start gap-4 min-w-0">
                      <div className="shrink-0 mt-0.5">
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
                        <p className="font-medium text-sm" style={{ color: "var(--text)" }}>{order.customer_name}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {order.customer_email}
                          {order.customer_phone ? ` · ${order.customer_phone}` : ""}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                          {new Date(order.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                          · {order.order_items.length} item{order.order_items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    {/* Right: subtotal + quick status */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className="text-lg font-black" style={{ color: "var(--text)" }}>
                        {order.subtotal > 0 ? formatPrice(order.subtotal) : "—"}
                      </span>
                      {/* Quick status changer */}
                      <div onClick={e => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={e => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                          disabled={updatingOrder === order.id}
                          className="h-8 px-2.5 rounded-lg border text-xs font-semibold outline-none cursor-pointer"
                          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}>
                          {ALL_STATUSES.map(s => (
                            <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Expanded: items + notes */}
                  {expandedOrder === order.id && (
                    <div className="p-5 space-y-4" style={{ backgroundColor: "var(--bg-subtle)" }}>
                      {/* Items table */}
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3"
                          style={{ color: "var(--text-muted)" }}>Order Items</h4>
                        <div className="rounded-xl overflow-hidden border" style={{ borderColor: "var(--border)" }}>
                          <table className="w-full text-sm">
                            <thead>
                              <tr style={{ backgroundColor: "var(--bg-card)", borderBottom: "1px solid var(--border)" }}>
                                <th className="text-left py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Product</th>
                                <th className="text-left py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Category</th>
                                <th className="text-center py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Qty</th>
                                <th className="text-right py-2.5 px-4 text-xs font-semibold" style={{ color: "var(--text-muted)" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody style={{ backgroundColor: "var(--bg-card)" }}>
                              {order.order_items.map((item, i) => (
                                <tr key={item.id}
                                  style={{ borderTop: i > 0 ? "1px solid var(--border)" : "none" }}>
                                  <td className="py-2.5 px-4 font-medium" style={{ color: "var(--text)" }}>
                                    {item.product_name}
                                  </td>
                                  <td className="py-2.5 px-4" style={{ color: "var(--text-muted)" }}>
                                    {item.category ?? "—"}
                                  </td>
                                  <td className="py-2.5 px-4 text-center font-semibold" style={{ color: "var(--text)" }}>
                                    {item.quantity}
                                  </td>
                                  <td className="py-2.5 px-4 text-right font-semibold" style={{ color: "var(--text)" }}>
                                    {item.price != null ? formatPrice(item.price * item.quantity) : "On request"}
                                  </td>
                                </tr>
                              ))}
                              {/* Subtotal row */}
                              <tr style={{ borderTop: "2px solid var(--border)", backgroundColor: "var(--bg-subtle)" }}>
                                <td colSpan={3} className="py-3 px-4 text-right text-sm font-bold" style={{ color: "var(--text-muted)" }}>
                                  Subtotal
                                </td>
                                <td className="py-3 px-4 text-right text-base font-black" style={{ color: "var(--text)" }}>
                                  {order.subtotal > 0 ? formatPrice(order.subtotal) : "—"}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Customer notes */}
                      {order.notes && (
                        <div className="rounded-xl p-4 border"
                          style={{ backgroundColor: "#fefce8", borderColor: "#fde68a" }}>
                          <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "#92400e" }}>
                            Customer Note
                          </p>
                          <p className="text-sm" style={{ color: "#78350f" }}>{order.notes}</p>
                        </div>
                      )}

                      {/* Admin notes + status update */}
                      <AdminNoteEditor order={order} onUpdate={updateOrderStatus} updating={updatingOrder === order.id} />
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          PRODUCTS TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Products ({products.length})</h2>
            <button onClick={openCreate}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              <Plus className="w-4 h-4" />Add Product
            </button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                      {["Product","Category","Price","Status","Actions"].map((h, i) => (
                        <th key={h} className={`py-3 px-4 font-semibold text-xs uppercase tracking-wide ${i === 4 ? "text-right" : "text-left"}`}
                          style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(p => (
                      <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td className="py-3 px-4">
                          <p className="font-medium" style={{ color: "var(--text)" }}>{p.product_name}</p>
                          <p className="text-xs mt-0.5 truncate max-w-xs" style={{ color: "var(--text-muted)" }}>
                            {p.description.slice(0, 55)}…
                          </p>
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>
                          {p.categories?.category_name ?? "—"}
                        </td>
                        <td className="py-3 px-4 font-medium" style={{ color: "var(--text)" }}>
                          {p.price != null ? formatPrice(p.price) : <span style={{ color: "var(--text-light)" }}>—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={p.is_active ? "success" : "secondary"} className="w-fit">
                              {p.is_active ? "Active" : "Inactive"}
                            </Badge>
                            {p.is_featured && <Badge variant="outline" className="w-fit text-xs">Featured</Badge>}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => openEdit(p)}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--bg-subtle)"; (e.currentTarget as HTMLElement).style.color = "var(--text)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteModal({ open: true, id: p.id, name: p.product_name })}
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                              style={{ color: "var(--text-muted)" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(220,38,38,0.08)"; (e.currentTarget as HTMLElement).style.color = "var(--error)"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>
                        No products. Click &quot;Add Product&quot; to get started.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          CATEGORIES TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Categories ({catList.length})</h2>
            <button onClick={() => setCatModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              <Plus className="w-4 h-4" />Add Category
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catList.map(cat => (
              <Card key={cat.id} className="hover:shadow-warm-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl shrink-0" style={{ backgroundColor: "var(--accent-light)" }}>
                      <FolderOpen className="w-5 h-5" style={{ color: "var(--accent)" }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: "var(--text)" }}>{cat.category_name}</p>
                      {cat.description && (
                        <p className="text-xs mt-0.5 truncate" style={{ color: "var(--text-muted)" }}>{cat.description}</p>
                      )}
                      <p className="text-xs mt-1" style={{ color: "var(--text-light)" }}>
                        {products.filter(p => p.category_id === cat.id).length} products
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {catList.length === 0 && (
              <div className="col-span-3 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No categories yet.</div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════
          USERS TAB
      ════════════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold" style={{ color: "var(--text)" }}>Registered Users ({users.length})</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ backgroundColor: "var(--bg-subtle)", borderBottom: "1px solid var(--border)" }}>
                      {["Name","Email","Mobile","Role","Joined"].map(h => (
                        <th key={h} className="text-left py-3 px-4 font-semibold text-xs uppercase tracking-wide"
                          style={{ color: "var(--text-muted)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id} style={{ borderBottom: "1px solid var(--border)" }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--bg-subtle)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}>
                        <td className="py-3 px-4 font-medium" style={{ color: "var(--text)" }}>{u.full_name}</td>
                        <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{u.email}</td>
                        <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{u.mobile_number ?? "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role === "admin" ? "Admin" : "Customer"}</Badge>
                        </td>
                        <td className="py-3 px-4" style={{ color: "var(--text-muted)" }}>{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ════ PRODUCT MODAL ════ */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Product Name *</Label>
              <Input id="p-name" value={formData.product_name}
                onChange={e => setFormData({ ...formData, product_name: e.target.value })}
                placeholder="e.g. Premium Wireless Headphones" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description *</Label>
              <Textarea id="p-desc" value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                rows={3} placeholder="Detailed product description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={formData.category_id || "none"}
                  onValueChange={v => setFormData({ ...formData, category_id: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {catList.map(c => <SelectItem key={c.id} value={c.id}>{c.category_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price (₹)</Label>
                <Input id="p-price" type="number" min="0" step="1" value={formData.price}
                  onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-img">Image URL</Label>
              <Input id="p-img" type="url" value={formData.image_url}
                onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://images.unsplash.com/…" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="p-feat" checked={formData.is_featured}
                  onCheckedChange={c => setFormData({ ...formData, is_featured: !!c })} />
                <Label htmlFor="p-feat" className="font-normal cursor-pointer">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="p-act" checked={formData.is_active}
                  onCheckedChange={c => setFormData({ ...formData, is_active: !!c })} />
                <Label htmlFor="p-act" className="font-normal cursor-pointer">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setProductModal(false)}
              className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Cancel
            </button>
            <button onClick={saveProduct} disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Product"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════ DELETE CONFIRM ════ */}
      <Dialog open={deleteModal.open} onOpenChange={o => !o && setDeleteModal({ open: false, id: "", name: "" })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: "var(--error)" }}>
              <AlertTriangle className="w-5 h-5" />Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <button onClick={() => setDeleteModal({ open: false, id: "", name: "" })}
              className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Cancel
            </button>
            <button onClick={deleteProduct} disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--error)" }}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : "Delete"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ════ CATEGORY MODAL ════ */}
      <Dialog open={catModal} onOpenChange={setCatModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" value={catForm.category_name}
                onChange={e => setCatForm({ ...catForm, category_name: e.target.value })}
                placeholder="e.g. Electronics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Input id="cat-desc" value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })}
                placeholder="Optional" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <button onClick={() => setCatModal(false)}
              className="px-4 py-2 rounded-xl border text-sm font-medium"
              style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}>
              Cancel
            </button>
            <button onClick={saveCategory} disabled={savingCat}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ backgroundColor: "var(--accent)" }}>
              {savingCat ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Category"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
   ADMIN NOTE EDITOR — sub-component for order notes
───────────────────────────────────────────────────────────────────────────── */
function AdminNoteEditor({
  order, onUpdate, updating,
}: {
  order: OrderWithItems;
  onUpdate: (id: string, status: OrderStatus, notes?: string) => void;
  updating: boolean;
}) {
  const [note, setNote] = useState(order.admin_notes ?? "");

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
          Admin Notes (visible to your team only)
        </label>
        <textarea
          rows={2}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Add internal notes about this order…"
          className="w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none outline-none transition-all"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--bg-card)", color: "var(--text)" }}
          onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
          onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onUpdate(order.id, order.status, note)}
          disabled={updating || note === (order.admin_notes ?? "")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50"
          style={{ backgroundColor: "var(--accent)" }}>
          {updating ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Saving…</> : "Save Notes"}
        </button>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          Last updated: {new Date(order.updated_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
        </span>
      </div>
    </div>
  );
}

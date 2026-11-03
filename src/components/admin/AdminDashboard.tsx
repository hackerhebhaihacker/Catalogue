"use client";

import React, { useState } from "react";
import {
  LayoutDashboard, Package, FolderOpen, Users, Plus,
  Pencil, Trash2, BarChart3, AlertTriangle, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { formatPrice, formatDate } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { ProductWithCategory, Category, Profile } from "@/types/database";

interface Stats {
  totalProducts: number;
  totalUsers: number;
  activeProducts: number;
  featuredProducts: number;
}

interface Props {
  initialProducts: ProductWithCategory[];
  categories: Category[];
  users: Profile[];
  stats: Stats;
}

type Tab = "overview" | "products" | "categories" | "users";

interface ProductFormData {
  product_name: string;
  description: string;
  category_id: string;
  image_url: string;
  price: string;
  is_featured: boolean;
  is_active: boolean;
}

const emptyProduct: ProductFormData = {
  product_name: "",
  description: "",
  category_id: "",
  image_url: "",
  price: "",
  is_featured: false,
  is_active: true,
};

export default function AdminDashboard({ initialProducts, categories, users, stats }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [products, setProducts] = useState(initialProducts);
  const [productModal, setProductModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: "", name: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProductFormData>(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [catModal, setCatModal] = useState(false);
  const [catList, setCatList] = useState(categories);
  const [catForm, setCatForm] = useState({ category_name: "", description: "" });
  const [savingCat, setSavingCat] = useState(false);
  const { toast } = useToast();

  const openCreate = () => { setEditingId(null); setFormData(emptyProduct); setProductModal(true); };
  const openEdit = (p: ProductWithCategory) => {
    setEditingId(p.id);
    setFormData({
      product_name: p.product_name,
      description: p.description,
      category_id: p.category_id ?? "",
      image_url: p.image_url ?? "",
      price: p.price != null ? String(p.price) : "",
      is_featured: p.is_featured,
      is_active: p.is_active,
    });
    setProductModal(true);
  };

  const saveProduct = async () => {
    if (!formData.product_name.trim() || !formData.description.trim()) {
      toast({ title: "Name and description are required.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        product_name: formData.product_name.trim(),
        description: formData.description.trim(),
        category_id: formData.category_id || null,
        image_url: formData.image_url.trim() || null,
        price: formData.price ? parseFloat(formData.price) : null,
        is_featured: formData.is_featured,
        is_active: formData.is_active,
      };
      const url = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";
      const method = editingId ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? "Failed"); }
      const { data: saved } = await res.json();
      const withCategory = { ...saved, categories: catList.find(c => c.id === saved.category_id) ?? null } as ProductWithCategory;
      if (editingId) {
        setProducts(prev => prev.map(p => p.id === editingId ? withCategory : p));
        toast({ title: "Product updated successfully." });
      } else {
        setProducts(prev => [withCategory, ...prev]);
        toast({ title: "Product created successfully." });
      }
      setProductModal(false);
    } catch (err: unknown) {
      toast({ title: "Error", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
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
    } catch {
      toast({ title: "Could not delete product.", variant: "destructive" });
    } finally { setDeleting(false); }
  };

  const saveCategory = async () => {
    if (!catForm.category_name.trim()) { toast({ title: "Category name is required.", variant: "destructive" }); return; }
    setSavingCat(true);
    try {
      const res = await fetch("/api/admin/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(catForm) });
      if (!res.ok) throw new Error("Failed");
      const { data } = await res.json();
      setCatList(prev => [...prev, data]);
      setCatForm({ category_name: "", description: "" });
      setCatModal(false);
      toast({ title: "Category created." });
    } catch {
      toast({ title: "Error creating category.", variant: "destructive" });
    } finally { setSavingCat(false); }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview",    label: "Overview",    icon: LayoutDashboard },
    { id: "products",    label: "Products",    icon: Package },
    { id: "categories",  label: "Categories",  icon: FolderOpen },
    { id: "users",       label: "Users",       icon: Users },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Manage products, categories and users</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl mb-8 w-fit overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === id
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <div className="space-y-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: "Total Products",    value: stats.totalProducts,    icon: Package,    bg: "bg-blue-50",   text: "text-blue-600"   },
              { label: "Active Products",   value: stats.activeProducts,   icon: BarChart3,  bg: "bg-green-50",  text: "text-green-600"  },
              { label: "Featured Products", value: stats.featuredProducts, icon: Package,    bg: "bg-amber-50",  text: "text-amber-600"  },
              { label: "Registered Users",  value: stats.totalUsers,       icon: Users,      bg: "bg-purple-50", text: "text-purple-600" },
            ].map(s => (
              <Card key={s.label}>
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${s.bg}`}><s.icon className={`w-6 h-6 ${s.text}`} /></div>
                  <div>
                    <p className="text-2xl font-bold text-slate-900">{s.value}</p>
                    <p className="text-sm text-slate-500">{s.label}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Products</CardTitle>
              <Button size="sm" onClick={() => setActiveTab("products")}>View All</Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm text-slate-900">{p.product_name}</p>
                      <p className="text-xs text-slate-500">{p.categories?.category_name ?? "Uncategorised"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={p.is_active ? "success" : "secondary"}>{p.is_active ? "Active" : "Inactive"}</Badge>
                      {p.price != null && <span className="text-sm font-medium text-slate-700">{formatPrice(p.price)}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Users</CardTitle>
              <Button size="sm" onClick={() => setActiveTab("users")}>View All</Button>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-100">
                {users.slice(0, 5).map(u => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-sm text-slate-900">{u.full_name}</p>
                      <p className="text-xs text-slate-500">{u.email}</p>
                    </div>
                    <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PRODUCTS ── */}
      {activeTab === "products" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Products ({products.length})</h2>
            <Button onClick={openCreate}><Plus className="w-4 h-4" />Add Product</Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Product</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-900">{p.product_name}</div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">{p.description.slice(0, 55)}…</div>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{p.categories?.category_name ?? "—"}</td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {p.price != null ? formatPrice(p.price) : <span className="text-slate-400">—</span>}
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
                            <Button variant="ghost" size="sm" onClick={() => openEdit(p)} className="text-slate-600 hover:text-slate-900">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setDeleteModal({ open: true, id: p.id, name: p.product_name })} className="text-red-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-400">No products yet. Click "Add Product" to get started.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── CATEGORIES ── */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Categories ({catList.length})</h2>
            <Button onClick={() => setCatModal(true)}><Plus className="w-4 h-4" />Add Category</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catList.map(cat => (
              <Card key={cat.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg shrink-0"><FolderOpen className="w-5 h-5 text-blue-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">{cat.category_name}</p>
                      {cat.description && <p className="text-xs text-slate-500 mt-0.5 truncate">{cat.description}</p>}
                      <p className="text-xs text-slate-400 mt-1">{products.filter(p => p.category_id === cat.id).length} products</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {catList.length === 0 && <div className="col-span-3 py-12 text-center text-slate-400">No categories yet.</div>}
          </div>
        </div>
      )}

      {/* ── USERS ── */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-slate-900">Registered Users ({users.length})</h2>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Mobile</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Role</th>
                      <th className="text-left py-3 px-4 font-semibold text-slate-500">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-slate-900">{u.full_name}</td>
                        <td className="py-3 px-4 text-slate-500">{u.email}</td>
                        <td className="py-3 px-4 text-slate-500">{u.mobile_number ?? "—"}</td>
                        <td className="py-3 px-4">
                          <Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">{formatDate(u.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── PRODUCT MODAL ── */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Product" : "Add New Product"}</DialogTitle>
            <DialogDescription>Fill in the product details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="p-name">Product Name *</Label>
              <Input id="p-name" value={formData.product_name} onChange={e => setFormData({ ...formData, product_name: e.target.value })} placeholder="e.g. Premium Wireless Headphones" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-desc">Description *</Label>
              <Textarea id="p-desc" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={4} placeholder="Detailed product description…" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="p-cat">Category</Label>
                <Select value={formData.category_id || "none"} onValueChange={v => setFormData({ ...formData, category_id: v === "none" ? "" : v })}>
                  <SelectTrigger id="p-cat"><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {catList.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.category_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="p-price">Price (₹)</Label>
                <Input id="p-price" type="number" min="0" step="1" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="0" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-img">Image URL</Label>
              <Input id="p-img" type="url" value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="https://images.unsplash.com/…" />
              <p className="text-xs text-slate-400">Use an Unsplash URL or any public image link.</p>
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Checkbox id="p-featured" checked={formData.is_featured} onCheckedChange={c => setFormData({ ...formData, is_featured: !!c })} />
                <Label htmlFor="p-featured" className="font-normal cursor-pointer">Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="p-active" checked={formData.is_active} onCheckedChange={c => setFormData({ ...formData, is_active: !!c })} />
                <Label htmlFor="p-active" className="font-normal cursor-pointer">Active</Label>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setProductModal(false)}>Cancel</Button>
            <Button onClick={saveProduct} disabled={saving}>
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── DELETE CONFIRM ── */}
      <Dialog open={deleteModal.open} onOpenChange={o => !o && setDeleteModal({ open: false, id: "", name: "" })}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />Delete Product
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteModal.name}</strong>? This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, id: "", name: "" })}>Cancel</Button>
            <Button variant="destructive" onClick={deleteProduct} disabled={deleting}>
              {deleting ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── CATEGORY MODAL ── */}
      <Dialog open={catModal} onOpenChange={setCatModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Category</DialogTitle>
            <DialogDescription>Create a new product category.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="cat-name">Category Name *</Label>
              <Input id="cat-name" value={catForm.category_name} onChange={e => setCatForm({ ...catForm, category_name: e.target.value })} placeholder="e.g. Electronics" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cat-desc">Description</Label>
              <Input id="cat-desc" value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} placeholder="Optional description" />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setCatModal(false)}>Cancel</Button>
            <Button onClick={saveCategory} disabled={savingCat}>
              {savingCat ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : "Save Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

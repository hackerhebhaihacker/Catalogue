"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export interface CartItem {
  id: string;
  product_name: string;
  category: string;
  price: number | null;
  image_url: string | null;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  count: number;            // total units
  subtotal: number;
  isOpen: boolean;
  openCart:  () => void;
  closeCart: () => void;
  add:    (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear:  () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "nexus_cart";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"); } catch { return []; }
}
function save(items: CartItem[]) {
  if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => { setItems(load()); }, []);

  const setAndSave = (next: CartItem[]) => { setItems(next); save(next); };

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const next = existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
      save(next);
      return next;
    });
    setIsOpen(true); // auto-open cart drawer on add
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => { const next = prev.filter(i => i.id !== id); save(next); return next; });
  }, []);

  const update = useCallback((id: string, quantity: number) => {
    setItems(prev => {
      const next = quantity <= 0 ? prev.filter(i => i.id !== id) : prev.map(i => i.id === id ? { ...i, quantity } : i);
      save(next);
      return next;
    });
  }, []);

  const clear  = useCallback(() => { save([]); setItems([]); }, []);
  const openCart  = useCallback(() => setIsOpen(true),  []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count    = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, count, subtotal, isOpen, openCart, closeCart, add, remove, update, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

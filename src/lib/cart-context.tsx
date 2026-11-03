"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

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
  count: number;
  subtotal: number;
  isOpen: boolean;
  userId: string | null;
  openCart:  () => void;
  closeCart: () => void;
  add:    (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear:  () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

// Returns a user-scoped key so each profile has an isolated cart
function storageKey(userId: string | null): string {
  return userId ? `nexus_cart_v2_${userId}` : "nexus_cart_v2_guest";
}

function load(userId: string | null): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        typeof i.id === "string" &&
        typeof i.product_name === "string" &&
        typeof i.quantity === "number" &&
        i.quantity > 0
    );
  } catch {
    return [];
  }
}

function save(items: CartItem[], userId: string | null) {
  if (typeof window !== "undefined") {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  }
}

function dedupe(items: CartItem[]): CartItem[] {
  const map = new Map<string, CartItem>();
  for (const item of items) {
    const existing = map.get(item.id);
    if (existing) {
      map.set(item.id, { ...existing, quantity: existing.quantity + item.quantity });
    } else {
      map.set(item.id, { ...item });
    }
  }
  return Array.from(map.values());
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems]     = useState<CartItem[]>([]);
  const [isOpen, setIsOpen]   = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [userId, setUserId]   = useState<string | null>(null);
  const supabase = createClient();

  // Resolve current user, then load THAT user's cart
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id ?? null;
      setUserId(uid);
      const loaded = dedupe(load(uid));
      setItems(loaded);
      save(loaded, uid);
      setHydrated(true);
    });

    // Re-scope cart when user signs in or out
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      const loaded = dedupe(load(uid));
      setItems(loaded);
      save(loaded, uid);
    });

    return () => listener.subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = useCallback((item: Omit<CartItem, "quantity">) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      const next = existing
        ? prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...prev, { ...item, quantity: 1 }];
      // Read current userId from closure — use functional update to avoid stale closure
      save(next, userId);
      return next;
    });
    setIsOpen(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const remove = useCallback((id: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.id !== id);
      save(next, userId);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const update = useCallback((id: string, quantity: number) => {
    setItems(prev => {
      const next = quantity <= 0
        ? prev.filter(i => i.id !== id)
        : prev.map(i => i.id === id ? { ...i, quantity } : i);
      save(next, userId);
      return next;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const clear = useCallback(() => {
    save([], userId);
    setItems([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const openCart  = useCallback(() => setIsOpen(true),  []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const count    = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + (i.price ?? 0) * i.quantity, 0);

  const value: CartContextValue = {
    items: hydrated ? items : [],
    count: hydrated ? count : 0,
    subtotal: hydrated ? subtotal : 0,
    isOpen,
    userId,
    openCart,
    closeCart,
    add,
    remove,
    update,
    clear,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getEnquiryList, addToEnquiry, removeFromEnquiry,
  updateQuantity, clearEnquiry,
  type EnquiryItem,
} from "@/lib/enquiry-store";

interface EnquiryContextValue {
  items: EnquiryItem[];
  count: number;
  add:    (item: Omit<EnquiryItem, "quantity">) => void;
  remove: (id: string) => void;
  update: (id: string, quantity: number) => void;
  clear:  () => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

export function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<EnquiryItem[]>([]);

  // Hydrate from localStorage once on mount
  useEffect(() => { setItems(getEnquiryList()); }, []);

  const add    = useCallback((item: Omit<EnquiryItem, "quantity">) => setItems(addToEnquiry(item)), []);
  const remove = useCallback((id: string)  => setItems(removeFromEnquiry(id)), []);
  const update = useCallback((id: string, q: number) => setItems(updateQuantity(id, q)), []);
  const clear  = useCallback(() => { clearEnquiry(); setItems([]); }, []);

  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <EnquiryContext.Provider value={{ items, count, add, remove, update, clear }}>
      {children}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry() {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used within EnquiryProvider");
  return ctx;
}

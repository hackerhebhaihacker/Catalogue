/**
 * Enquiry list — persisted in localStorage.
 * Since this is a product CATALOGUE (not an ecommerce store),
 * users "enquire" about products rather than "buy" them.
 */

export interface EnquiryItem {
  id: string;
  product_name: string;
  category: string;
  price: number | null;
  image_url: string | null;
  quantity: number;
}

const KEY = "nexus_enquiry_list";

export function getEnquiryList(): EnquiryItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as EnquiryItem[];
  } catch {
    return [];
  }
}

export function addToEnquiry(item: Omit<EnquiryItem, "quantity">): EnquiryItem[] {
  const list = getEnquiryList();
  const existing = list.find(i => i.id === item.id);
  let next: EnquiryItem[];
  if (existing) {
    next = list.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
  } else {
    next = [...list, { ...item, quantity: 1 }];
  }
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function removeFromEnquiry(id: string): EnquiryItem[] {
  const next = getEnquiryList().filter(i => i.id !== id);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function updateQuantity(id: string, quantity: number): EnquiryItem[] {
  const next = quantity <= 0
    ? getEnquiryList().filter(i => i.id !== id)
    : getEnquiryList().map(i => i.id === id ? { ...i, quantity } : i);
  localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function clearEnquiry(): void {
  localStorage.setItem(KEY, "[]");
}

export function buildEnquiryEmail(items: EnquiryItem[], contactEmail: string): string {
  const lines = items.map(i => `• ${i.product_name} (Qty: ${i.quantity})${i.price ? ` — ₹${i.price.toLocaleString("en-IN")}` : ""}`).join("\n");
  const subject = encodeURIComponent(`Product Enquiry — ${items.length} item${items.length > 1 ? "s" : ""}`);
  const body = encodeURIComponent(
    `Hello,\n\nI am interested in enquiring about the following products:\n\n${lines}\n\nPlease provide pricing, availability and delivery details.\n\nThank you.`
  );
  return `mailto:${contactEmail}?subject=${subject}&body=${body}`;
}

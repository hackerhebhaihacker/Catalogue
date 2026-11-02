// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONFIGURATION  –  Edit this file to customise the business details.
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Business identity */
  name: "Nexus Commerce",
  tagline: "Premium Products. Trusted Quality.",
  description:
    "Nexus Commerce offers a curated selection of premium products designed for professionals and enthusiasts alike. Explore our catalogue and discover excellence in every item.",
  shortDescription: "Your trusted partner for premium products.",

  /** Contact details */
  email: "contact@nexuscommerce.com",
  phone: "+1 (555) 012-3456",
  address: "123 Business Avenue, Commerce City, CA 90210, USA",

  /** Social media links */
  social: {
    facebook: "https://facebook.com",
    twitter: "https://twitter.com",
    instagram: "https://instagram.com",
    linkedin: "https://linkedin.com",
  },

  /** Brand */
  primaryColor: "#2563EB", // blue-600

  /** Admin email for notifications */
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@nexuscommerce.com",

  /** SEO */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ogImage: "/og-image.png",
  keywords: [
    "business products",
    "premium catalogue",
    "professional services",
    "quality products",
  ],
};

export type SiteConfig = typeof siteConfig;

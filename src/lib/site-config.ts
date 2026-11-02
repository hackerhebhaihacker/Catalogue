// ─────────────────────────────────────────────────────────────────────────────
//  SITE CONFIGURATION
//  All values fall back to env vars first, then sensible defaults.
//  Set these in .env.local (local) or Vercel Environment Variables (production).
// ─────────────────────────────────────────────────────────────────────────────

export const siteConfig = {
  /** Business identity */
  name: process.env.NEXT_PUBLIC_BUSINESS_NAME ?? "Nexus Commerce",
  tagline: process.env.NEXT_PUBLIC_BUSINESS_TAGLINE ?? "Premium Products. Trusted Quality.",
  description:
    process.env.NEXT_PUBLIC_BUSINESS_DESCRIPTION ??
    "Nexus Commerce offers a curated selection of premium products designed for professionals and enthusiasts alike.",
  shortDescription:
    process.env.NEXT_PUBLIC_BUSINESS_SHORT_DESC ?? "Your trusted partner for premium products.",

  /** Contact details — set these in your environment variables */
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@nexuscommerce.com",
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "",
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS ?? "",

  /** Social media — set to empty string "" to hide a link */
  social: {
    facebook:  process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK  ?? "",
    twitter:   process.env.NEXT_PUBLIC_SOCIAL_TWITTER   ?? "",
    instagram: process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM ?? "",
    linkedin:  process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN  ?? "",
  },

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

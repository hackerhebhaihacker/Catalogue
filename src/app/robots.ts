import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/register", "/login", "/products"],
        disallow: ["/admin", "/dashboard", "/api/"],
      },
    ],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}

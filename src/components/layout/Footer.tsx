import React from "react";
import Link from "next/link";
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg text-white">{siteConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-400 mb-5">
              {siteConfig.shortDescription}
            </p>
            <div className="flex gap-3">
              {[
                { icon: Facebook, href: siteConfig.social.facebook, label: "Facebook" },
                { icon: Twitter, href: siteConfig.social.twitter, label: "Twitter" },
                { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
                { icon: Linkedin, href: siteConfig.social.linkedin, label: "LinkedIn" },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-lg bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-[hsl(var(--primary))] hover:text-white transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/", label: "Home" },
                { href: "/#about", label: "About Us" },
                { href: "/#featured", label: "Featured Products" },
                { href: "/products", label: "Product Catalogue" },
                { href: "/#contact", label: "Contact Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="font-semibold text-white mb-4">Account</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { href: "/register", label: "Create Account" },
                { href: "/login", label: "Sign In" },
                { href: "/dashboard", label: "My Dashboard" },
                { href: "/login?tab=reset", label: "Forgot Password" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{siteConfig.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.phone}`}
                  className="flex items-start gap-2.5 text-gray-400 hover:text-white transition-colors"
                >
                  <Phone className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{siteConfig.phone}</span>
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{siteConfig.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="bg-gray-800 mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

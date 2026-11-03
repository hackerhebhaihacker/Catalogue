"use client";
import React from "react";
import Link from "next/link";
import { ShoppingBag, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

export default function Footer() {
  const year = new Date().getFullYear();
  const social = [
    { icon: Facebook,  href: siteConfig.social.facebook,  label: "Facebook"  },
    { icon: Twitter,   href: siteConfig.social.twitter,   label: "Twitter"   },
    { icon: Instagram, href: siteConfig.social.instagram, label: "Instagram" },
    { icon: Linkedin,  href: siteConfig.social.linkedin,  label: "LinkedIn"  },
  ].filter(s => !!s.href);

  return (
    <footer style={{ backgroundColor: "#141210", color: "#a8a29e" }} role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: "var(--accent)" }}>
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-lg" style={{ color: "white" }}>{siteConfig.name}</span>
            </Link>
            <p className="text-sm leading-relaxed mb-5">{siteConfig.shortDescription}</p>
            {social.length > 0 && (
              <div className="flex gap-3">
                {social.map(({ icon: Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#a8a29e" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "white"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "#a8a29e"; }}>
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider" style={{ color: "white" }}>Quick Links</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href:"/", label:"Home" },
                { href:"/#about", label:"About Us" },
                { href:"/#featured", label:"Featured Products" },
                { href:"/products", label:"Product Catalogue" },
                { href:"/#contact", label:"Contact Us" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors link-underline" style={{ color: "#a8a29e" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#a8a29e")}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider" style={{ color: "white" }}>Account</h3>
            <ul className="space-y-3 text-sm">
              {[
                { href:"/register", label:"Create Account" },
                { href:"/login", label:"Sign In" },
                { href:"/dashboard", label:"My Dashboard" },
              ].map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="transition-colors" style={{ color: "#a8a29e" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#a8a29e")}>
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-5 uppercase tracking-wider" style={{ color: "white" }}>Contact</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <a href={`mailto:${siteConfig.email}`} className="flex items-start gap-2.5 transition-colors"
                  style={{ color: "#a8a29e" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "white")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#a8a29e")}>
                  <Mail className="w-4 h-4 mt-0.5 shrink-0" />{siteConfig.email}
                </a>
              </li>
              {siteConfig.phone && (
                <li>
                  <a href={`tel:${siteConfig.phone}`} className="flex items-start gap-2.5 transition-colors"
                    style={{ color: "#a8a29e" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "white")}
                    onMouseLeave={e => (e.currentTarget.style.color = "#a8a29e")}>
                    <Phone className="w-4 h-4 mt-0.5 shrink-0" />{siteConfig.phone}
                  </a>
                </li>
              )}
              {siteConfig.address && (
                <li className="flex items-start gap-2.5" style={{ color: "#a8a29e" }}>
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />{siteConfig.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "#78716c" }}>
          <p>© {year} {siteConfig.name}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="transition-colors hover:text-[#a8a29e]">Privacy Policy</Link>
            <Link href="/terms" className="transition-colors hover:text-[#a8a29e]">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

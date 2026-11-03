"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingBag, LogOut, User, Settings, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About" },
  { href: "/#featured", label: "Products" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState("user");
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        supabase.from("profiles").select("role").eq("id", data.user.id).single()
          .then(({ data: p }) => { if (p) setRole(p.role); });
      }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-md border-b border-[var(--border)] shadow-[0_2px_20px_-4px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
              style={{ backgroundColor: "var(--accent)" }}>
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className={cn(
              "font-bold text-lg tracking-tight transition-colors font-display",
              scrolled ? "text-[var(--text)]" : "text-white"
            )}>
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 link-underline",
                  scrolled
                    ? pathname === link.href ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    : "text-white/80 hover:text-white"
                )}>
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/products"
                className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-all link-underline",
                  scrolled
                    ? pathname === "/products" ? "text-[var(--accent)]" : "text-[var(--text-muted)] hover:text-[var(--text)]"
                    : "text-white/80 hover:text-white"
                )}>
                Catalogue
              </Link>
            )}
          </div>

          {/* Auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                {role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                    style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                    <Settings className="w-3.5 h-3.5" />Admin
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all"
                  style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--text-muted)"; }}>
                  <User className="w-3.5 h-3.5" />Dashboard
                </Link>
                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--error)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-muted)")}>
                  <LogOut className="w-3.5 h-3.5" />Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{ color: scrolled ? "var(--text-muted)" : "rgba(255,255,255,0.85)" }}
                  onMouseEnter={e => (e.currentTarget.style.color = scrolled ? "var(--text)" : "white")}
                  onMouseLeave={e => (e.currentTarget.style.color = scrolled ? "var(--text-muted)" : "rgba(255,255,255,0.85)")}>
                  Sign In
                </Link>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <Link href="/register" className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all shadow-warm-sm"
                    style={{ backgroundColor: "var(--accent)" }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--accent-dark)")}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--accent)")}>
                    Get Started
                  </Link>
                </motion.div>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg transition-colors"
            style={{ color: scrolled ? "var(--text)" : "white" }}
            aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="md:hidden overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
              <div className="py-4 px-2 space-y-1">
                {navLinks.map((link) => (
                  <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
                    style={{ color: "var(--text)" }}>
                    {link.label}
                  </Link>
                ))}
                {user && (
                  <Link href="/products" onClick={() => setOpen(false)}
                    className="block px-4 py-2.5 rounded-lg text-sm font-medium"
                    style={{ color: "var(--text)" }}>
                    <Package className="w-4 h-4 inline mr-2" />Catalogue
                  </Link>
                )}
                <div className="pt-3 mt-3 flex flex-col gap-2 px-2" style={{ borderTop: "1px solid var(--border)" }}>
                  {user ? (
                    <>
                      {role === "admin" && (
                        <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border"
                          style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                          <Settings className="w-4 h-4" />Admin Dashboard
                        </Link>
                      )}
                      <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                        <User className="w-4 h-4" />My Dashboard
                      </Link>
                      <button onClick={() => { handleLogout(); setOpen(false); }} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-left"
                        style={{ color: "var(--error)" }}>
                        <LogOut className="w-4 h-4" />Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium border text-center"
                        style={{ borderColor: "var(--border)", color: "var(--text)" }}>
                        Sign In
                      </Link>
                      <Link href="/register" onClick={() => setOpen(false)} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white text-center"
                        style={{ backgroundColor: "var(--accent)" }}>
                        Get Started Free
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}

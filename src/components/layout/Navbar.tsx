"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ShoppingBag, LogOut, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";
import { cn } from "@/lib/utils";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/#about", label: "About Us" },
  { href: "/#featured", label: "Products" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [role, setRole] = useState<string>("user");
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
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    router.refresh();
  };

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href.replace("/#", "/"));

  return (
    <header className={cn(
      "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
      scrolled ? "bg-white shadow-sm border-b border-slate-200" : "bg-transparent"
    )}>
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-white" />
            </div>
            <span className={cn("font-bold text-lg tracking-tight transition-colors", scrolled ? "text-slate-900" : "text-white")}>
              {siteConfig.name}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  scrolled
                    ? isActive(link.href) ? "text-blue-600 bg-blue-50" : "text-slate-700 hover:bg-slate-100"
                    : isActive(link.href) ? "text-white bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"
                )}>
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/products"
                className={cn("px-4 py-2 rounded-md text-sm font-medium transition-colors",
                  scrolled
                    ? pathname === "/products" ? "text-blue-600 bg-blue-50" : "text-slate-700 hover:bg-slate-100"
                    : pathname === "/products" ? "text-white bg-white/20" : "text-white/90 hover:text-white hover:bg-white/10"
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
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/admin"><Settings className="w-4 h-4" />Admin</Link>
                  </Button>
                )}
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard"><User className="w-4 h-4" />Dashboard</Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant={scrolled ? "outline" : "ghost"} size="sm" asChild
                  className={!scrolled ? "text-white border-white/30 hover:bg-white/10" : ""}>
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild><Link href="/register">Register</Link></Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)}
            className={cn("md:hidden p-2 rounded-md", scrolled ? "text-slate-900" : "text-white")}
            aria-label="Toggle menu">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-slate-200 rounded-b-xl shadow-lg py-4 px-2">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                {link.label}
              </Link>
            ))}
            {user && (
              <Link href="/products" onClick={() => setOpen(false)}
                className="block px-4 py-2.5 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors">
                Catalogue
              </Link>
            )}
            <div className="mt-3 pt-3 border-t border-slate-200 flex flex-col gap-2 px-2">
              {user ? (
                <>
                  {role === "admin" && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href="/admin" onClick={() => setOpen(false)}>Admin Dashboard</Link>
                    </Button>
                  )}
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard" onClick={() => setOpen(false)}>My Dashboard</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { handleLogout(); setOpen(false); }}>Logout</Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/login" onClick={() => setOpen(false)}>Login</Link>
                  </Button>
                  <Button size="sm" asChild>
                    <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}

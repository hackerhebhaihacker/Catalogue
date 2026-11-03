import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Star, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

const stats = [
  { value: "500+", label: "Products" },
  { value: "10,000+", label: "Customers" },
  { value: "99%", label: "Satisfaction" },
];

const badges = [
  { icon: ShieldCheck, label: "Quality Certified" },
  { icon: Star, label: "Top Rated" },
  { icon: Truck, label: "Pan India Delivery" },
];

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-900" aria-label="Hero">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="Business showcase"
          fill
          priority
          className="object-cover opacity-30"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/95 to-slate-800/80" />
      </div>

      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full z-0 pointer-events-none">
        <div className="absolute top-1/4 right-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-32 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 tracking-wide uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            Premium Business Catalogue
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] mb-6 tracking-tight">
            Products<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-300">
              Built to Last
            </span>
          </h1>

          <p className="text-lg text-slate-300 mb-10 leading-relaxed max-w-xl">
            {siteConfig.description}
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-14">
            <Button size="lg" asChild className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-blue-900/40">
              <Link href="/register">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="border-white/20 text-white hover:bg-white/10 bg-white/5 px-8 h-12 text-base">
              <Link href="/#featured">View Products</Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {badges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-slate-400 text-sm">
                <Icon className="w-4 h-4 text-blue-400" />
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="mt-20 flex flex-wrap gap-10">
          {stats.map(s => (
            <div key={s.label}>
              <div className="text-4xl font-black text-white">{s.value}</div>
              <div className="text-sm text-slate-400 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full" />
        </div>
      </div>
    </section>
  );
}

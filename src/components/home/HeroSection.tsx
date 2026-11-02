import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-config";

export default function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Background image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="Modern business showcase"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/75 to-blue-800/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-950/60 via-transparent to-transparent" />
      </div>

      {/* Decorative circles */}
      <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm font-medium px-4 py-1.5 rounded-full mb-8">
          <Sparkles className="w-4 h-4" />
          Premium Quality Products
        </div>

        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
          Discover Products
          <br />
          <span className="text-blue-300">Built to Last</span>
        </h1>

        <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          {siteConfig.description}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="xl" asChild className="shadow-xl shadow-blue-900/30">
            <Link href="/products">
              Explore Products
              <ArrowRight className="w-5 h-5" />
            </Link>
          </Button>
          <Button
            size="xl"
            variant="outline"
            asChild
            className="border-white/30 text-white bg-white/10 hover:bg-white/20 backdrop-blur-sm"
          >
            <Link href="/register">Register Now</Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="mt-20 grid grid-cols-3 gap-8 max-w-lg mx-auto">
          {[
            { value: "500+", label: "Products" },
            { value: "10K+", label: "Customers" },
            { value: "99%", label: "Satisfaction" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-3xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-white/60 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/50 animate-bounce">
        <div className="w-5 h-8 border-2 border-white/30 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
}

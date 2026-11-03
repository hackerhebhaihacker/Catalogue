"use client";
import React, { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ShieldCheck, RotateCcw, CreditCard, Star } from "lucide-react";
import { siteConfig } from "@/lib/site-config";

const trustBadges = [
  { icon: ShieldCheck, label: "Secure Payments" },
  { icon: RotateCcw, label: "Easy Returns" },
  { icon: CreditCard, label: "EMI Available" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden" style={{ backgroundColor: "#1a1814" }} aria-label="Hero">
      {/* Parallax background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&q=80"
          alt="Business showcase"
          fill
          priority
          className="object-cover"
          style={{ opacity: 0.25 }}
          sizes="100vw"
        />
      </motion.div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 z-0" style={{ background: "linear-gradient(135deg, rgba(26,24,20,0.98) 0%, rgba(26,24,20,0.85) 50%, rgba(79,70,229,0.15) 100%)" }} />
      {/* Accent glow */}
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(79,70,229,0.18) 0%, transparent 70%)", filter: "blur(40px)" }} />

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 w-full"
        style={{ y: textY }}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <motion.div variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 mb-8 text-xs font-semibold tracking-widest uppercase"
            style={{ borderColor: "rgba(79,70,229,0.4)", color: "rgba(165,163,255,0.9)", backgroundColor: "rgba(79,70,229,0.1)" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: "#818cf8" }} />
            Premium Business Catalogue
          </motion.div>

          {/* Headline */}
          <motion.h1 variants={itemVariants}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6 text-white">
            Products<br />
            <span style={{ background: "linear-gradient(135deg, #818cf8 0%, #6366f1 50%, #4f46e5 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Built to Last
            </span>
          </motion.h1>

          <motion.p variants={itemVariants} className="text-lg leading-relaxed mb-10 max-w-xl" style={{ color: "rgba(255,255,255,0.65)" }}>
            {siteConfig.description}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-14">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white shadow-lg transition-all"
                style={{ backgroundColor: "var(--accent)", boxShadow: "0 8px 32px rgba(79,70,229,0.45)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--accent-dark)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--accent)")}>
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
              <Link href="/#featured"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl text-base font-medium border transition-all"
                style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(255,255,255,0.06)" }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.12)")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.06)")}>
                Browse Products
              </Link>
            </motion.div>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-6">
            {trustBadges.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2" style={{ color: "rgba(255,255,255,0.5)" }}>
                <Icon className="w-4 h-4" style={{ color: "#818cf8" }} />
                <span className="text-sm">{label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div variants={itemVariants} className="mt-20 flex flex-wrap gap-12">
          {[
            { value: "500+", label: "Products" },
            { value: "10,000+", label: "Happy Customers" },
            { value: "99%", label: "Satisfaction Rate" },
            { value: "4.9", label: "Average Rating", icon: Star },
          ].map(s => (
            <div key={s.label}>
              <div className="flex items-center gap-1.5">
                <span className="text-4xl font-black text-white font-display">{s.value}</span>
                {s.icon && <s.icon className="w-5 h-5 fill-yellow-400 text-yellow-400" />}
              </div>
              <div className="text-sm mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</div>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
        <div className="w-5 h-8 rounded-full flex justify-center pt-1.5"
          style={{ border: "2px solid rgba(255,255,255,0.2)" }}>
          <div className="w-1 h-2 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.4)" }} />
        </div>
      </motion.div>
    </section>
  );
}

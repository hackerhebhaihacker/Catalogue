"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { siteConfig } from "@/lib/site-config";

const pillars = [
  { title: "Our Mission", body: "Deliver premium products with unmatched quality and reliability, empowering every customer to achieve their goals with confidence.", accent: "var(--accent)" },
  { title: "Our Vision", body: "Become India's most trusted product catalogue for professionals and businesses — a name synonymous with quality.", accent: "#7c3aed" },
  { title: "Our Values", body: "Integrity, innovation and customer-first thinking guide every product selection and business decision we make.", accent: "#0891b2" },
];

const highlights = ["ISO-certified quality standards", "Dedicated 24/7 customer support", "Trusted by 10,000+ businesses", "Eco-conscious product sourcing"];

export default function AboutSection() {
  const { ref, inView } = useInView();

  return (
    <section id="about" ref={ref as React.RefObject<HTMLElement>} className="py-28" style={{ backgroundColor: "var(--bg)" }} aria-labelledby="about-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Label + heading */}
        <motion.div className="text-center mb-20"
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>Who We Are</span>
          <h2 id="about-heading" className="font-display mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            About {siteConfig.name}
          </h2>
          <p className="mt-5 text-lg max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            A company built on the belief that quality products and outstanding service go hand in hand.
          </p>
        </motion.div>

        {/* Two-column */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div className="relative"
            initial={{ opacity: 0, x: -40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.2 }}>
            <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-warm-xl">
              <Image src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80" alt="Our office" fill className="object-cover" sizes="(max-width:1024px) 100vw, 50vw" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, transparent 60%, rgba(79,70,229,0.15))" }} />
            </div>
            {/* Floating stat */}
            <motion.div
              className="absolute -bottom-6 -right-6 rounded-2xl px-6 py-5 border"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-lg)" }}
              initial={{ opacity: 0, scale: 0.8 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.5, delay: 0.5 }}>
              <div className="font-display text-3xl font-black" style={{ color: "var(--accent)" }}>12+</div>
              <div className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Years of Excellence</div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay: 0.3 }}>
            <h3 className="font-display text-2xl font-bold mb-5" style={{ color: "var(--text)" }}>Building Trust Through Quality</h3>
            <p className="leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
              {siteConfig.name} was founded with a simple yet powerful idea: customers deserve access to the best products with complete transparency and confidence.
            </p>
            <p className="leading-relaxed mb-8" style={{ color: "var(--text-muted)" }}>
              Our expert team evaluates, tests and selects products that genuinely make a difference. We don&apos;t compromise — and neither should you.
            </p>
            <ul className="space-y-3">
              {highlights.map((item, i) => (
                <motion.li key={item} className="flex items-center gap-3 text-sm" style={{ color: "var(--text)" }}
                  initial={{ opacity: 0, x: 16 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.4, delay: 0.4 + i * 0.08 }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0" style={{ color: "var(--success)" }} />
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Pillars */}
        <div className="grid sm:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <motion.div key={p.title}
              className="rounded-2xl p-8 border relative overflow-hidden"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
              initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              whileHover={{ y: -4, boxShadow: "var(--shadow-md)" }}>
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-2xl" style={{ backgroundColor: p.accent }} />
              <h4 className="font-display text-lg font-bold mb-3" style={{ color: "var(--text)" }}>{p.title}</h4>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{p.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

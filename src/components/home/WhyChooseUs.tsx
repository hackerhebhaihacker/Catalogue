"use client";
import React from "react";
import { motion } from "framer-motion";
import { Shield, Zap, HeartHandshake, Star, Award, Clock } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";

const reasons = [
  { icon: Shield,         title: "Quality Guaranteed",   body: "Every product is rigorously tested and meets our strict quality standards.",    c: "#4f46e5", bg: "rgba(79,70,229,0.08)"   },
  { icon: Zap,            title: "Fast & Reliable",       body: "Consistent availability backed by our robust pan-India supply chain.",           c: "#d97706", bg: "rgba(217,119,6,0.08)"   },
  { icon: HeartHandshake, title: "Customer First",        body: "Our dedicated support team helps you find the perfect product for your needs.",   c: "#e11d48", bg: "rgba(225,29,72,0.08)"   },
  { icon: Star,           title: "Premium Selection",     body: "Hand-picked products from trusted manufacturers and industry leaders.",           c: "#7c3aed", bg: "rgba(124,58,237,0.08)"  },
  { icon: Award,          title: "Certified Excellence",  body: "Multiple industry certifications ensure you receive only the best quality.",      c: "#059669", bg: "rgba(5,150,105,0.08)"   },
  { icon: Clock,          title: "Always Available",      body: "Browse our catalogue 24/7 from any device, anywhere in the world.",               c: "#0891b2", bg: "rgba(8,145,178,0.08)"   },
];

export default function WhyChooseUs() {
  const { ref, inView } = useInView();

  return (
    <section id="why-choose-us" ref={ref as React.RefObject<HTMLElement>} className="py-28" style={{ backgroundColor: "var(--bg-subtle)" }} aria-labelledby="why-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>Why Us</span>
          <h2 id="why-heading" className="font-display mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Why Choose Us?
          </h2>
          <p className="mt-5 text-lg max-w-2xl mx-auto" style={{ color: "var(--text-muted)" }}>
            We go beyond simply listing products — our commitment to excellence is what sets us apart.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reasons.map((r, i) => (
            <motion.div key={r.title}
              className="rounded-2xl p-8 border cursor-default"
              style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
              initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -5, boxShadow: "var(--shadow-lg)", borderColor: r.c + "55" }}>
              <motion.div className="inline-flex p-3.5 rounded-2xl mb-5" style={{ backgroundColor: r.bg }}
                whileHover={{ scale: 1.1 }} transition={{ type: "spring", stiffness: 400 }}>
                <r.icon className="w-6 h-6" style={{ color: r.c }} />
              </motion.div>
              <h3 className="font-semibold mb-2" style={{ color: "var(--text)", fontSize: "1rem" }}>{r.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>{r.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

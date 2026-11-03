"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { useInView } from "@/hooks/use-in-view";
import { siteConfig } from "@/lib/site-config";

export default function ContactSection() {
  const { ref, inView } = useInView();
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(form) });
      setStatus(res.ok ? "success" : "error");
      if (res.ok) setForm({ name:"", email:"", subject:"", message:"" });
    } catch { setStatus("error"); }
    setTimeout(() => setStatus(s => s === "success" ? "success" : "idle"), 5000);
  };

  const items = [
    { icon: Mail, label: "Email", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    ...(siteConfig.phone ? [{ icon: Phone, label: "Phone", value: siteConfig.phone, href: `tel:${siteConfig.phone}` }] : []),
    ...(siteConfig.address ? [{ icon: MapPin, label: "Address", value: siteConfig.address, href: undefined as string | undefined }] : []),
  ];

  return (
    <section id="contact" ref={ref as React.RefObject<HTMLElement>} className="py-28" style={{ backgroundColor: "var(--bg)" }} aria-labelledby="contact-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div className="text-center mb-16"
          initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6 }}>
          <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>Get In Touch</span>
          <h2 id="contact-heading" className="font-display mt-3 text-4xl sm:text-5xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
            Contact Us
          </h2>
          <p className="mt-5 text-lg max-w-xl mx-auto" style={{ color: "var(--text-muted)" }}>
            Have a question or want to learn more? We&apos;d love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <motion.div className="space-y-8"
            initial={{ opacity: 0, x: -32 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
            <div>
              <h3 className="font-display text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>Let&apos;s start a conversation</h3>
              <p className="leading-relaxed" style={{ color: "var(--text-muted)" }}>
                Whether you&apos;re looking for product information, have a business inquiry, or just want to say hello — our team is here to help.
              </p>
            </div>
            {items.map(({ icon: Icon, label, value, href }) => (
              <div key={label} className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "var(--accent-light)" }}>
                  <Icon className="w-5 h-5" style={{ color: "var(--accent)" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: "var(--text-light)" }}>{label}</p>
                  {href
                    ? <a href={href} className="font-medium link-underline" style={{ color: "var(--text)" }}>{value}</a>
                    : <p className="font-medium" style={{ color: "var(--text)" }}>{value}</p>
                  }
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div
            className="rounded-3xl border p-8"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-md)" }}
            initial={{ opacity: 0, x: 32 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.2 }}>
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center gap-4">
                <motion.div className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(22,163,74,0.1)" }}
                  initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
                  <CheckCircle className="w-8 h-8" style={{ color: "var(--success)" }} />
                </motion.div>
                <h4 className="text-xl font-bold" style={{ color: "var(--text)" }}>Message Sent!</h4>
                <p style={{ color: "var(--text-muted)" }}>Thank you for reaching out. We&apos;ll reply within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {[
                  { id:"n", label:"Full Name", type:"text", key:"name", placeholder:"Rahul Sharma" },
                  { id:"e", label:"Email Address", type:"email", key:"email", placeholder:"rahul@example.com" },
                  { id:"s", label:"Subject", type:"text", key:"subject", placeholder:"Product enquiry" },
                ].map(f => (
                  <div key={f.id} className="space-y-1.5">
                    <label htmlFor={f.id} className="block text-sm font-medium" style={{ color: "var(--text)" }}>{f.label}</label>
                    <input id={f.id} type={f.type} placeholder={f.placeholder} required
                      value={form[f.key as keyof typeof form]}
                      onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full h-10 px-3.5 rounded-xl border text-sm outline-none transition-all"
                      style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                      onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                      onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                  </div>
                ))}
                <div className="space-y-1.5">
                  <label htmlFor="msg" className="block text-sm font-medium" style={{ color: "var(--text)" }}>Message</label>
                  <textarea id="msg" rows={4} placeholder="Tell us how we can help…" required
                    value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none outline-none transition-all"
                    style={{ borderColor: "var(--border)", backgroundColor: "var(--bg)", color: "var(--text)" }}
                    onFocus={e => (e.currentTarget.style.borderColor = "var(--accent)")}
                    onBlur={e => (e.currentTarget.style.borderColor = "var(--border)")} />
                </div>
                {status === "error" && <p className="text-sm" style={{ color: "var(--error)" }}>Something went wrong. Please try again.</p>}
                <motion.button type="submit" disabled={status === "loading"}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all"
                  style={{ backgroundColor: "var(--accent)" }}
                  whileHover={{ backgroundColor: "var(--accent-dark)" }}
                  whileTap={{ scale: 0.97 }}>
                  {status === "loading" ? "Sending…" : <><Send className="w-4 h-4" />Send Message</>}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

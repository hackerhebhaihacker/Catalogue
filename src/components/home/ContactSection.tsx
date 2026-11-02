"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { siteConfig } from "@/lib/site-config";

export default function ContactSection() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
    setTimeout(() => setStatus("idle"), 5000);
  };

  return (
    <section id="contact" className="py-24 bg-[hsl(var(--muted)/0.3)]" aria-labelledby="contact-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-sm font-semibold tracking-wider text-[hsl(var(--primary))] uppercase">
            Get In Touch
          </span>
          <h2
            id="contact-heading"
            className="mt-2 text-4xl font-bold text-[hsl(var(--foreground))] tracking-tight"
          >
            Contact Us
          </h2>
          <p className="mt-4 text-lg text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto">
            Have a question or want to learn more? We'd love to hear from you.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact info */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-[hsl(var(--foreground))] mb-4">
                Let's start a conversation
              </h3>
              <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                Whether you're looking for product information, have a business inquiry
                or just want to say hello — our team is here to help.
              </p>
            </div>

            <div className="space-y-5">
              {[
                { icon: Mail, label: "Email Address", value: siteConfig.email, href: `mailto:${siteConfig.email}` },
                { icon: Phone, label: "Phone Number", value: siteConfig.phone, href: `tel:${siteConfig.phone}` },
                { icon: MapPin, label: "Office Address", value: siteConfig.address, href: undefined },
              ].map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[hsl(var(--primary)/0.1)] flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[hsl(var(--primary))]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[hsl(var(--muted-foreground))]">{label}</p>
                    {href ? (
                      <a href={href} className="text-[hsl(var(--foreground))] hover:text-[hsl(var(--primary))] transition-colors font-medium">
                        {value}
                      </a>
                    ) : (
                      <p className="text-[hsl(var(--foreground))] font-medium">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] p-8 shadow-sm">
            {status === "success" ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h4 className="text-xl font-semibold text-[hsl(var(--foreground))]">Message Sent!</h4>
                <p className="text-[hsl(var(--muted-foreground))]">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="contact-name">Full Name</Label>
                    <Input
                      id="contact-name"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact-email">Email Address</Label>
                    <Input
                      id="contact-email"
                      type="email"
                      placeholder="jane@example.com"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-subject">Subject</Label>
                  <Input
                    id="contact-subject"
                    placeholder="Product enquiry"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-message">Message</Label>
                  <Textarea
                    id="contact-message"
                    placeholder="Tell us how we can help..."
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-[hsl(var(--destructive))]">
                    Something went wrong. Please try again or email us directly.
                  </p>
                )}
                <Button type="submit" className="w-full" disabled={status === "loading"}>
                  {status === "loading" ? (
                    "Sending…"
                  ) : (
                    <>
                      Send Message
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

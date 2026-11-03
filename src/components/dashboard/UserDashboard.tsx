"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, Mail, Phone, Calendar, ShoppingBag, Settings, Shield } from "lucide-react";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { siteConfig } from "@/lib/site-config";

interface Props { profile: Profile | null; }

export default function UserDashboard({ profile }: Props) {
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: "var(--bg-subtle)" }}>
          <User className="w-8 h-8" style={{ color: "var(--text-light)" }} />
        </div>
        <h2 className="text-xl font-bold mb-2" style={{ color: "var(--text)" }}>Profile Not Found</h2>
        <p className="mb-6" style={{ color: "var(--text-muted)" }}>
          Your profile could not be loaded. Please try signing out and back in.
        </p>
        <Link href="/" className="inline-flex px-6 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: "var(--accent)" }}>Go Home</Link>
      </div>
    );
  }

  const actions = [
    { icon: ShoppingBag, title: "Browse Catalogue", desc: "Explore all available products", href: "/products", bg: "rgba(79,70,229,0.08)", c: "var(--accent)" },
    { icon: Mail, title: "Contact Us", desc: "Get in touch with our team", href: "/#contact", bg: "rgba(5,150,105,0.08)", c: "#059669" },
    ...(profile.role === "admin" ? [{ icon: Settings, title: "Admin Dashboard", desc: "Manage products and users", href: "/admin", bg: "rgba(124,58,237,0.08)", c: "#7c3aed" }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "var(--accent)" }}>My Account</span>
        <h1 className="font-display mt-2 text-3xl font-bold" style={{ color: "var(--text)" }}>
          Welcome back, {profile.full_name.split(" ")[0]}!
        </h1>
        <p style={{ color: "var(--text-muted)" }}>Manage your account and browse our catalogue.</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <motion.div className="lg:col-span-1 rounded-2xl border p-8 text-center"
          style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
          initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "var(--accent-light)" }}>
            <User className="w-10 h-10" style={{ color: "var(--accent)" }} />
          </div>
          <h2 className="font-display text-xl font-bold mb-1" style={{ color: "var(--text)" }}>{profile.full_name}</h2>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: profile.role === "admin" ? "var(--accent-light)" : "var(--bg-subtle)", color: profile.role === "admin" ? "var(--accent)" : "var(--text-muted)" }}>
            {profile.role === "admin" && <Shield className="w-3 h-3" />}
            {profile.role === "admin" ? "Administrator" : "Member"}
          </span>

          <div className="mt-6 space-y-4 text-sm text-left">
            {[
              { icon: Mail, val: profile.email },
              ...(profile.mobile_number ? [{ icon: Phone, val: profile.mobile_number }] : []),
              { icon: Calendar, val: `Joined ${formatDate(profile.created_at)}` },
            ].map(({ icon: Icon, val }) => (
              <div key={val} className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" style={{ color: "var(--text-muted)" }} />
                <span className="truncate" style={{ color: "var(--text-muted)" }}>{val}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick actions */}
          <motion.div className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}>
            <h3 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {actions.map((a, i) => (
                <motion.div key={a.title} whileHover={{ y: -2 }} transition={{ duration: 0.18 }}>
                  <Link href={a.href}
                    className="flex items-start gap-4 p-5 rounded-2xl border transition-all"
                    style={{ borderColor: "var(--border)" }}
                    onMouseEnter={e => (e.currentTarget.style.borderColor = a.c)}
                    onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}>
                    <div className="p-2.5 rounded-xl shrink-0" style={{ backgroundColor: a.bg }}>
                      <a.icon className="w-5 h-5" style={{ color: a.c }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>{a.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{a.desc}</p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Account details */}
          <motion.div className="rounded-2xl border p-6"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border)", boxShadow: "var(--shadow-sm)" }}
            initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <h3 className="font-semibold mb-5" style={{ color: "var(--text)" }}>Account Details</h3>
            <dl className="space-y-0 text-sm">
              {[
                { label: "Full Name", value: profile.full_name },
                { label: "Email Address", value: profile.email },
                { label: "Mobile Number", value: profile.mobile_number ?? "Not provided" },
                { label: "Role", value: profile.role === "admin" ? "Administrator" : "Member" },
                { label: "Member Since", value: formatDate(profile.created_at) },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                  <dt style={{ color: "var(--text-muted)" }}>{label}</dt>
                  <dd className="font-medium" style={{ color: "var(--text)" }}>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="text-xs mt-4" style={{ color: "var(--text-light)" }}>
              To update your details, contact us at{" "}
              <a href={`mailto:${siteConfig.email}`} className="link-underline" style={{ color: "var(--accent)" }}>{siteConfig.email}</a>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

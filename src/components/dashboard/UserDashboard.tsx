"use client";

import React from "react";
import Link from "next/link";
import { User, Mail, Phone, Calendar, ShoppingBag, Settings, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import type { Profile } from "@/types/database";
import { siteConfig } from "@/lib/site-config";

interface Props {
  profile: Profile | null;
}

export default function UserDashboard({ profile }: Props) {
  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-[hsl(var(--muted-foreground))]">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-[hsl(var(--foreground))]">My Dashboard</h1>
        <p className="text-[hsl(var(--muted-foreground))] mt-1">
          Welcome back, {profile.full_name.split(" ")[0]}!
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="w-20 h-20 rounded-full bg-[hsl(var(--primary)/0.1)] flex items-center justify-center mx-auto mb-4">
                <User className="w-10 h-10 text-[hsl(var(--primary))]" />
              </div>
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <Badge
                variant={profile.role === "admin" ? "default" : "secondary"}
                className="mx-auto mt-1"
              >
                {profile.role === "admin" ? (
                  <><Shield className="w-3 h-3 mr-1" />Administrator</>
                ) : (
                  "Member"
                )}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--foreground))] truncate">{profile.email}</span>
              </div>
              {profile.mobile_number && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                  <span className="text-[hsl(var(--foreground))]">{profile.mobile_number}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                <span className="text-[hsl(var(--foreground))]">
                  Joined {formatDate(profile.created_at)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  {
                    icon: ShoppingBag,
                    title: "Browse Catalogue",
                    description: "Explore all available products",
                    href: "/products",
                    color: "bg-blue-50 text-blue-600",
                  },
                  {
                    icon: Mail,
                    title: "Contact Us",
                    description: "Get in touch with our team",
                    href: "/#contact",
                    color: "bg-green-50 text-green-600",
                  },
                  ...(profile.role === "admin"
                    ? [
                        {
                          icon: Settings,
                          title: "Admin Dashboard",
                          description: "Manage products and users",
                          href: "/admin",
                          color: "bg-purple-50 text-purple-600",
                        },
                      ]
                    : []),
                ].map((action) => (
                  <Link
                    key={action.title}
                    href={action.href}
                    className="flex items-start gap-4 p-5 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary)/0.4)] hover:shadow-sm transition-all"
                  >
                    <div className={`p-2.5 rounded-lg ${action.color}`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-[hsl(var(--foreground))]">{action.title}</p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">{action.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Account info */}
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                {[
                  { label: "Full Name", value: profile.full_name },
                  { label: "Email Address", value: profile.email },
                  { label: "Mobile Number", value: profile.mobile_number ?? "Not provided" },
                  { label: "Account Role", value: profile.role === "admin" ? "Administrator" : "Member" },
                  { label: "Member Since", value: formatDate(profile.created_at) },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[hsl(var(--border))] last:border-0">
                    <dt className="text-[hsl(var(--muted-foreground))]">{label}</dt>
                    <dd className="font-medium text-[hsl(var(--foreground))]">{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mt-5 pt-4 border-t border-[hsl(var(--border))]">
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Need to update your details? Contact us at{" "}
                  <a href={`mailto:${siteConfig.email}`} className="text-[hsl(var(--primary))] hover:underline">
                    {siteConfig.email}
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

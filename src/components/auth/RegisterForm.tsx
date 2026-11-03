"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ShoppingBag, CheckCircle2, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { siteConfig } from "@/lib/site-config";

const schema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100).regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens and apostrophes"),
    email: z.string().email("Please enter a valid email address"),
    mobileNumber: z.string().regex(/^\+?[0-9]{7,15}$/, "Enter a valid mobile number (7–15 digits)"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/\d/, "Must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Must contain at least one special character"),
    confirmPassword: z.string(),
    acceptTerms: z.boolean().refine(v => v, "You must accept the terms and conditions"),
  })
  .refine(d => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterForm() {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName: data.fullName, email: data.email, mobileNumber: data.mobileNumber, password: data.password }),
      });
      const json = await res.json();
      if (!res.ok) { setServerError(json.error ?? "Registration failed. Please try again."); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login?registered=1"), 2500);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 p-10 text-center">
        <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Account Created!</h2>
        <p className="text-slate-500">Welcome to {siteConfig.name}. Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white text-center">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">Create Your Account</h1>
        <p className="text-blue-100 text-sm mt-1">Join {siteConfig.name} today — it&apos;s free</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-8 space-y-5" noValidate>
        {/* Full Name */}
        <div className="space-y-1.5">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" placeholder="Rahul Sharma" {...register("fullName")} />
          {errors.fullName && <p className="text-xs text-red-500" role="alert">{errors.fullName.message}</p>}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" type="email" placeholder="rahul@example.com" {...register("email")} />
          {errors.email && <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>}
        </div>

        {/* Mobile */}
        <div className="space-y-1.5">
          <Label htmlFor="mobileNumber">Mobile Number</Label>
          <Input id="mobileNumber" type="tel" placeholder="9876543210" {...register("mobileNumber")} />
          {errors.mobileNumber && <p className="text-xs text-red-500" role="alert">{errors.mobileNumber.message}</p>}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPw ? "text" : "password"} placeholder="Min 8 chars — A, a, 1, @" {...register("password")} className="pr-10" />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showPw ? "Hide password" : "Show password"}>
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500" role="alert">{errors.password.message}</p>}
        </div>

        {/* Confirm Password */}
        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Input id="confirmPassword" type={showConfirm ? "text" : "password"} placeholder="Repeat your password" {...register("confirmPassword")} className="pr-10" />
            <button type="button" onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label={showConfirm ? "Hide" : "Show"}>
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-500" role="alert">{errors.confirmPassword.message}</p>}
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2.5">
          <Checkbox id="acceptTerms" onCheckedChange={checked => setValue("acceptTerms", !!checked)} />
          <div>
            <Label htmlFor="acceptTerms" className="font-normal text-sm cursor-pointer text-slate-600 leading-relaxed">
              I agree to the{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">Terms and Conditions</Link>
              {" "}and{" "}
              <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </Label>
            {errors.acceptTerms && <p className="text-xs text-red-500 mt-1" role="alert">{errors.acceptTerms.message}</p>}
          </div>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">{serverError}</div>
        )}

        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
          {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</> : "Create Account"}
        </Button>

        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </form>
    </div>
  );
}

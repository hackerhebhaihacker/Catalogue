"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShoppingBag, Loader2, CheckCircle2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/lib/site-config";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional(),
});

const resetSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type LoginData = z.infer<typeof loginSchema>;
type ResetData = z.infer<typeof resetSchema>;

export default function LoginForm() {
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<"login" | "reset">("login");
  const [resetSent, setResetSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const registered = searchParams.get("registered") === "1";
  const redirectTo = searchParams.get("redirect") ?? "/products";

  const loginForm = useForm<LoginData>({ resolver: zodResolver(loginSchema) });
  const resetForm = useForm<ResetData>({ resolver: zodResolver(resetSchema) });

  const onLogin = async (data: LoginData) => {
    setServerError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      if (error.message.includes("Invalid login credentials")) {
        setServerError("Incorrect email or password. Please try again.");
      } else if (error.message.includes("Email not confirmed")) {
        setServerError("Please verify your email address before signing in.");
      } else {
        setServerError(error.message);
      }
      return;
    }

    router.push(redirectTo);
    router.refresh();
  };

  const onReset = async (data: ResetData) => {
    setServerError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      setServerError(error.message);
      return;
    }

    setResetSent(true);
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[hsl(var(--border))] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white text-center">
        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
          <ShoppingBag className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">
          {mode === "login" ? "Welcome Back" : "Reset Password"}
        </h1>
        <p className="text-blue-100 text-sm mt-1">
          {mode === "login" ? `Sign in to ${siteConfig.name}` : "We'll send you a reset link"}
        </p>
      </div>

      <div className="px-8 py-8">
        {/* Registered success message */}
        {registered && mode === "login" && (
          <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 mb-5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Account created successfully! Please sign in.
          </div>
        )}

        {/* ── LOGIN FORM ── */}
        {mode === "login" && (
          <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-5" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                {...loginForm.register("email")}
                aria-describedby="email-error"
              />
              {loginForm.formState.errors.email && (
                <p id="email-error" className="text-xs text-[hsl(var(--destructive))]" role="alert">
                  {loginForm.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button
                  type="button"
                  onClick={() => setMode("reset")}
                  className="text-xs text-[hsl(var(--primary))] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPw ? "text" : "password"}
                  placeholder="Your password"
                  {...loginForm.register("password")}
                  className="pr-10"
                  aria-describedby="password-error"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {loginForm.formState.errors.password && (
                <p id="password-error" className="text-xs text-[hsl(var(--destructive))]" role="alert">
                  {loginForm.formState.errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="rememberMe"
                onCheckedChange={(c) => loginForm.setValue("rememberMe", !!c)}
              />
              <Label htmlFor="rememberMe" className="font-normal text-sm cursor-pointer">
                Remember me
              </Label>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loginForm.formState.isSubmitting}
              size="lg"
            >
              {loginForm.formState.isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <p className="text-center text-sm text-[hsl(var(--muted-foreground))]">
              Don't have an account?{" "}
              <Link href="/register" className="text-[hsl(var(--primary))] font-medium hover:underline">
                Register now
              </Link>
            </p>
          </form>
        )}

        {/* ── RESET FORM ── */}
        {mode === "reset" && (
          <>
            {resetSent ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7 text-green-500" />
                </div>
                <h3 className="font-semibold text-[hsl(var(--foreground))]">Check your inbox</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  We've sent a password reset link to your email address.
                </p>
                <Button variant="outline" size="sm" onClick={() => { setMode("login"); setResetSent(false); }}>
                  Back to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-5" noValidate>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  Enter your email address and we'll send you a link to reset your password.
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="jane@example.com"
                    {...resetForm.register("email")}
                  />
                  {resetForm.formState.errors.email && (
                    <p className="text-xs text-[hsl(var(--destructive))]" role="alert">
                      {resetForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                {serverError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                    {serverError}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={resetForm.formState.isSubmitting} size="lg">
                  {resetForm.formState.isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                  ) : "Send Reset Link"}
                </Button>

                <button
                  type="button"
                  onClick={() => { setMode("login"); setServerError(null); }}
                  className="w-full text-center text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                >
                  ← Back to Sign In
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}

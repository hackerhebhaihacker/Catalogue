"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, CheckCircle2, ShoppingBag } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number")
      .regex(/[^A-Za-z0-9]/, "Must contain a special character"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const [showPw, setShowPw] = useState(false);
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    const { error } = await supabase.auth.updateUser({ password: data.password });
    if (error) {
      setServerError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/login"), 3000);
  };

  return (
    <div className="min-h-screen pt-16 bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[hsl(var(--border))] overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-7 text-white text-center">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-blue-100 text-sm mt-1">Choose a strong password</p>
        </div>

        <div className="px-8 py-8">
          {done ? (
            <div className="text-center space-y-4">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <h2 className="text-xl font-semibold">Password Updated!</h2>
              <p className="text-[hsl(var(--muted-foreground))] text-sm">
                Redirecting you to sign in…
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPw ? "text" : "password"}
                    placeholder="Min 8 chars with mixed types"
                    {...register("password")}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]"
                    aria-label="Toggle password"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-[hsl(var(--destructive))]" role="alert">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat new password"
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p className="text-xs text-[hsl(var(--destructive))]" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {serverError && (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700" role="alert">
                  {serverError}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</>
                ) : "Update Password"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

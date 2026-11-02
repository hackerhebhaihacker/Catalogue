import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { sendWelcomeEmail, sendAdminRegistrationAlert } from "@/lib/email";
import { z } from "zod";

const schema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  mobileNumber: z.string().regex(/^\+?[1-9]\d{7,14}$/),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/\d/)
    .regex(/[^A-Za-z0-9]/),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const { fullName, email, mobileNumber, password } = parsed.data;

    const supabase = await createAdminClient();

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      if (
        authError.message.includes("already been registered") ||
        authError.message.includes("already exists") ||
        authError.code === "email_exists"
      ) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }
      console.error("[register] auth error:", authError);
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    if (!authData.user) {
      return NextResponse.json({ error: "Failed to create user account." }, { status: 500 });
    }

    // Insert profile — use upsert so the trigger-created row doesn't cause a conflict
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: authData.user.id,
      full_name: fullName,
      email,
      mobile_number: mobileNumber,
      role: "user",
      updated_at: new Date().toISOString(),
    }, { onConflict: "id" });

    if (profileError) {
      console.error("[register] profile error:", profileError);
      // Roll back auth user if profile upsert fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: "Failed to save your profile. Please try again." },
        { status: 500 }
      );
    }

    // Send emails (non-blocking — failure here doesn't break registration)
    const now = new Date().toISOString();
    await Promise.allSettled([
      sendWelcomeEmail({ fullName, email }),
      sendAdminRegistrationAlert({ fullName, email, mobileNumber, registeredAt: now }),
    ]);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err) {
    console.error("[register] unexpected:", err);
    return NextResponse.json({ error: "An unexpected error occurred. Please try again." }, { status: 500 });
  }
}

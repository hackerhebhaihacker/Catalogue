import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

// Supports both the legacy ANON key name and the new publishable key name
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    SUPABASE_KEY
  );
}

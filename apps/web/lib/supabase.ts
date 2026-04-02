import { createBrowserClient } from "@supabase/ssr";

// Function form (not module singleton) avoids sharing state across renders.
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

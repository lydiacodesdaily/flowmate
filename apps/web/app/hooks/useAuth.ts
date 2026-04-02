"use client";

import { useState, useEffect, useCallback } from "react";
import type { User } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { mergeServerSessions } from "@/app/utils/sessionUtils";

const RC_USER_ID_KEY = "flowmate:v1:rcUserId";

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Restore session from cookie on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    // React to auth state changes (sign in, sign out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (event === "SIGNED_IN" && session?.user) {
        // Link any existing anonymous RevenueCat ID to this account (fire-and-forget)
        const rcId =
          typeof window !== "undefined"
            ? localStorage.getItem(RC_USER_ID_KEY)
            : null;
        if (rcId) {
          fetch("/api/users/link-rc", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rcCustomerId: rcId }),
          }).catch(() => {});
        }

        // Hydrate localStorage with any sessions stored on the server
        // (e.g. from a previous device or browser). Fire-and-forget.
        fetch("/api/sessions")
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => {
            if (data?.sessions?.length) {
              mergeServerSessions(data.sessions);
            }
          })
          .catch(() => {});
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithMagicLink = useCallback(async (email: string) => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo:
          typeof window !== "undefined" ? window.location.origin : undefined,
      },
    });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
  }, []);

  return { user, isLoading, signInWithMagicLink, signInWithGoogle, signOut };
}

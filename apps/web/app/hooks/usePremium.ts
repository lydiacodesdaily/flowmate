"use client";

import { useState, useEffect, useCallback, useRef } from "react";

export interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  paywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchasePackage: (plan: "monthly" | "annual") => Promise<void>;
  restorePurchases: () => Promise<void>;
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_ATTEMPTS = 10;

async function fetchIsPremium(): Promise<boolean> {
  const r = await fetch("/api/users/premium");
  if (!r.ok) return false;
  const data = await r.json();
  return data?.isPremium === true;
}

/**
 * @param supabaseUserId - When provided, fetches premium status from Supabase.
 *   Falls back to free when not signed in.
 */
export function usePremium(supabaseUserId?: string | null): PremiumState {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!supabaseUserId) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const isCheckoutSuccess = params?.get("checkout") === "success";
    const sessionId = params?.get("session_id") ?? null;

    if (isCheckoutSuccess && sessionId) {
      // Directly verify + activate via Stripe — no webhook dependency
      const activate = async () => {
        const r = await fetch("/api/stripe/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        if (r.ok) {
          setIsPremium(true);
        }
        setIsLoading(false);
        // Clean up query params without a page reload
        const url = new URL(window.location.href);
        url.searchParams.delete("checkout");
        url.searchParams.delete("session_id");
        window.history.replaceState({}, "", url.toString());
      };

      activate().catch(() => setIsLoading(false));
      return;
    }

    if (isCheckoutSuccess && !sessionId) {
      // Fallback: poll in case session_id wasn't in URL
      let attempts = 0;

      const poll = async () => {
        attempts++;
        const premium = await fetchIsPremium().catch(() => false);
        if (premium) {
          setIsPremium(true);
          setIsLoading(false);
          const url = new URL(window.location.href);
          url.searchParams.delete("checkout");
          window.history.replaceState({}, "", url.toString());
        } else if (attempts < POLL_MAX_ATTEMPTS) {
          pollTimerRef.current = setTimeout(poll, POLL_INTERVAL_MS);
        } else {
          setIsLoading(false);
        }
      };

      poll();

      return () => {
        if (pollTimerRef.current) clearTimeout(pollTimerRef.current);
      };
    }

    fetchIsPremium()
      .then((premium) => { if (premium) setIsPremium(true); })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [supabaseUserId]);

  const openPaywall = useCallback(() => setPaywallVisible(true), []);
  const closePaywall = useCallback(() => setPaywallVisible(false), []);

  const purchasePackage = useCallback(async (plan: "monthly" | "annual") => {
    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      throw new Error(data.error ?? "No checkout URL returned");
    }
  }, []);

  const restorePurchases = useCallback(async () => {
    const res = await fetch("/api/stripe/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  }, []);

  return {
    isPremium,
    isLoading,
    paywallVisible,
    openPaywall,
    closePaywall,
    purchasePackage,
    restorePurchases,
  };
}

"use client";

import { useState, useEffect, useCallback } from "react";

export interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  paywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchasePackage: (plan: "monthly" | "annual") => Promise<void>;
  restorePurchases: () => Promise<void>;
}

/**
 * @param supabaseUserId - When provided, fetches premium status from Supabase.
 *   Falls back to free when not signed in.
 */
export function usePremium(supabaseUserId?: string | null): PremiumState {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    if (!supabaseUserId) {
      setIsPremium(false);
      setIsLoading(false);
      return;
    }

    fetch("/api/users/premium")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.isPremium) setIsPremium(true);
      })
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
    if (data.url) window.location.href = data.url;
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

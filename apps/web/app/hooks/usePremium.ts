"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Purchases, type Offering } from "@revenuecat/purchases-js";

const RC_API_KEY = process.env.NEXT_PUBLIC_REVENUECAT_API_KEY ?? "";
const ENTITLEMENT_ID = "premium";
const USER_ID_KEY = "flowmate:v1:rcUserId";

function getOrCreateUserId(): string {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem(USER_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(USER_ID_KEY, id);
  }
  return id;
}

export interface PremiumState {
  isPremium: boolean;
  isLoading: boolean;
  offering: Offering | null;
  paywallVisible: boolean;
  openPaywall: () => void;
  closePaywall: () => void;
  purchasePackage: (rcPackageId: string) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
}

export function usePremium(): PremiumState {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offering, setOffering] = useState<Offering | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const purchasesRef = useRef<Purchases | null>(null);

  useEffect(() => {
    if (!RC_API_KEY) {
      setIsLoading(false);
      return;
    }
    const userId = getOrCreateUserId();
    const purchases = Purchases.configure(RC_API_KEY, userId);
    purchasesRef.current = purchases;

    (async () => {
      try {
        const [info, offerings] = await Promise.all([
          purchases.getCustomerInfo(),
          purchases.getOfferings(),
        ]);
        setIsPremium(
          info.entitlements.active[ENTITLEMENT_ID] !== undefined
        );
        if (offerings.current) setOffering(offerings.current);
      } catch (e) {
        console.warn("RevenueCat init error:", e);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const openPaywall = useCallback(() => setPaywallVisible(true), []);
  const closePaywall = useCallback(() => setPaywallVisible(false), []);

  const purchasePackage = useCallback(
    async (rcPackageId: string): Promise<boolean> => {
      const purchases = purchasesRef.current;
      if (!purchases) return false;
      const pkg = offering?.availablePackages.find(
        (p: { identifier: string }) => p.identifier === rcPackageId
      );
      if (!pkg) return false;
      try {
        const { customerInfo } = await purchases.purchase({ rcPackage: pkg });
        const active =
          customerInfo.entitlements.active[ENTITLEMENT_ID] !== undefined;
        setIsPremium(active);
        return active;
      } catch {
        return false;
      }
    },
    [offering]
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    const purchases = purchasesRef.current;
    if (!purchases) return false;
    try {
      const info = await purchases.getCustomerInfo();
      const active =
        info.entitlements.active[ENTITLEMENT_ID] !== undefined;
      setIsPremium(active);
      return active;
    } catch {
      return false;
    }
  }, []);

  return {
    isPremium,
    isLoading,
    offering,
    paywallVisible,
    openPaywall,
    closePaywall,
    purchasePackage,
    restorePurchases,
  };
}

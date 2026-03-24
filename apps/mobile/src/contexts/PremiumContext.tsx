import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_IOS ?? '';
const RC_API_KEY_ANDROID =
  process.env.EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID ?? '';

export const PREMIUM_ENTITLEMENT_ID = 'premium';

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  openPaywall: () => void;
  closePaywall: () => void;
  paywallVisible: boolean;
}

const PremiumContext = createContext<PremiumContextValue | undefined>(
  undefined
);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(true); // TODO: re-enable premium gate before launch
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [paywallVisible, setPaywallVisible] = useState(false);

  useEffect(() => {
    const apiKey =
      Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;
    if (!apiKey) {
      setIsLoading(false);
      return;
    }
    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }
    Purchases.configure({ apiKey });
    checkPremium();
    loadOfferings();
  }, []);

  const checkPremium = async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setIsPremium(
        info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined
      );
    } catch (e) {
      if (__DEV__) console.warn('RevenueCat checkPremium error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOfferings = async () => {
    try {
      const o = await Purchases.getOfferings();
      setOfferings(o);
    } catch (e) {
      if (__DEV__) console.warn('RevenueCat getOfferings error:', e);
    }
  };

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const active =
          customerInfo.entitlements.active[PREMIUM_ENTITLEMENT_ID] !==
          undefined;
        setIsPremium(active);
        return active;
      } catch (e: any) {
        if (!e.userCancelled) throw e;
        return false;
      }
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      const info = await Purchases.restorePurchases();
      const active =
        info.entitlements.active[PREMIUM_ENTITLEMENT_ID] !== undefined;
      setIsPremium(active);
      return active;
    } catch (e) {
      if (__DEV__) console.warn('RevenueCat restorePurchases error:', e);
      return false;
    }
  }, []);

  const openPaywall = useCallback(() => setPaywallVisible(true), []);
  const closePaywall = useCallback(() => setPaywallVisible(false), []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        offerings,
        purchasePackage,
        restorePurchases,
        openPaywall,
        closePaywall,
        paywallVisible,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used within PremiumProvider');
  return ctx;
}

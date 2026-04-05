import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type PurchasesPackage,
} from 'react-native-purchases';
import { useAuth } from './AuthContext';

// RevenueCat entitlement identifier — must match what you create in the RC dashboard
export const RC_ENTITLEMENT_ID = 'premium';

// RevenueCat offering identifier — 'default' unless you create a custom one
const RC_OFFERING_ID = 'default';

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  // Paywall visibility — any component calls showPaywall() to trigger the purchase flow.
  // If the user is not signed in, the auth modal is shown first, then paywall.
  showPaywall: () => void;
  hidePaywall: () => void;
  paywallVisible: boolean;
  // Auth modal visibility (shown when user taps a premium feature and is not signed in)
  authVisible: boolean;
  showAuth: () => void;
  hideAuth: () => void;
  // Purchase methods (called from PaywallModal)
  purchasePackage: (pkg: PurchasesPackage) => Promise<{ error: string | null }>;
  restorePurchases: () => Promise<{ error: string | null }>;
  // Packages fetched from RC (for PaywallModal to render)
  packages: PurchasesPackage[];
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [paywallVisible, setPaywallVisible] = useState(false);
  const [authVisible, setAuthVisible] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  // Track if paywall should open after successful auth
  const pendingPaywallAfterAuth = useRef(false);

  // Configure RevenueCat once on mount
  useEffect(() => {
    const apiKey =
      Platform.OS === 'ios'
        ? process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY
        : process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY;

    if (!apiKey) {
      console.warn(
        `[PremiumContext] Missing EXPO_PUBLIC_REVENUECAT_${
          Platform.OS === 'ios' ? 'APPLE' : 'GOOGLE'
        }_API_KEY — premium features disabled`
      );
      setIsLoading(false);
      return;
    }

    if (__DEV__) {
      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
    }

    Purchases.configure({ apiKey });
    loadOfferings();
  }, []);

  // When auth state changes, identify or log out the user in RC
  useEffect(() => {
    if (!isRCConfigured()) return;

    if (user) {
      // Use Supabase user ID as the RC App User ID — links mobile purchases to the same account as web
      Purchases.logIn(user.id)
        .then(({ customerInfo }) => {
          updatePremiumFromCustomerInfo(customerInfo);
        })
        .catch(console.error)
        .finally(() => setIsLoading(false));

      // If auth just completed and a paywall was pending, show it now
      if (pendingPaywallAfterAuth.current) {
        pendingPaywallAfterAuth.current = false;
        setPaywallVisible(true);
      }
    } else {
      // User signed out — log out of RC and reset premium state
      Purchases.logOut()
        .then((customerInfo) => updatePremiumFromCustomerInfo(customerInfo))
        .catch(() => setIsPremium(false))
        .finally(() => setIsLoading(false));
    }
  }, [user]);

  function isRCConfigured(): boolean {
    return !!(
      process.env.EXPO_PUBLIC_REVENUECAT_APPLE_API_KEY ||
      process.env.EXPO_PUBLIC_REVENUECAT_GOOGLE_API_KEY
    );
  }

  function updatePremiumFromCustomerInfo(info: CustomerInfo) {
    const entitlement = info.entitlements.active[RC_ENTITLEMENT_ID];
    setIsPremium(!!entitlement);
  }

  async function loadOfferings() {
    try {
      const offerings = await Purchases.getOfferings();
      const offering = offerings.current ?? offerings.all[RC_OFFERING_ID];
      if (offering) {
        setPackages(offering.availablePackages);
      }
    } catch (e) {
      console.warn('[PremiumContext] Could not load RC offerings:', e);
    }
  }

  const showPaywall = useCallback(() => {
    if (!user) {
      // Not signed in — show auth first; paywall will open after sign-in succeeds
      pendingPaywallAfterAuth.current = true;
      setAuthVisible(true);
    } else {
      setPaywallVisible(true);
    }
  }, [user]);

  const hidePaywall = useCallback(() => setPaywallVisible(false), []);

  const showAuth = useCallback(() => setAuthVisible(true), []);
  const hideAuth = useCallback(() => {
    setAuthVisible(false);
    // If user cancelled auth and had a pending paywall, clear it
    pendingPaywallAfterAuth.current = false;
  }, []);

  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<{ error: string | null }> => {
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        updatePremiumFromCustomerInfo(customerInfo);
        setPaywallVisible(false);
        return { error: null };
      } catch (e: unknown) {
        const err = e as { userCancelled?: boolean; message?: string };
        if (err.userCancelled) return { error: null }; // User cancelled — not an error
        return { error: err.message ?? 'Purchase failed. Please try again.' };
      }
    },
    []
  );

  const restorePurchases = useCallback(async (): Promise<{ error: string | null }> => {
    try {
      const customerInfo = await Purchases.restorePurchases();
      updatePremiumFromCustomerInfo(customerInfo);
      const wasRestored = !!customerInfo.entitlements.active[RC_ENTITLEMENT_ID];
      if (!wasRestored) {
        return { error: 'No active subscription found to restore.' };
      }
      setPaywallVisible(false);
      return { error: null };
    } catch (e: unknown) {
      return { error: (e as Error).message ?? 'Restore failed. Please try again.' };
    }
  }, []);

  return (
    <PremiumContext.Provider
      value={{
        isPremium,
        isLoading,
        showPaywall,
        hidePaywall,
        paywallVisible,
        authVisible,
        showAuth,
        hideAuth,
        purchasePackage,
        restorePurchases,
        packages,
      }}
    >
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium(): PremiumContextValue {
  const ctx = useContext(PremiumContext);
  if (!ctx) throw new Error('usePremium must be used inside PremiumProvider');
  return ctx;
}

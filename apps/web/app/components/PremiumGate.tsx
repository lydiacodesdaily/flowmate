"use client";

interface PremiumGateProps {
  /** Short label, e.g. "AI steps" or "Picture-in-Picture" */
  feature: string;
  isPremium: boolean;
  isLoading?: boolean;
  onUpgrade: () => void;
  children: React.ReactNode;
  /** Custom fallback — defaults to compact upgrade prompt */
  fallback?: React.ReactNode;
}

/**
 * Renders children for premium users; shows an upgrade prompt for free users.
 *
 * Usage:
 *   <PremiumGate feature="AI steps" isPremium={isPremium} onUpgrade={openPaywall}>
 *     <GenerateButton />
 *   </PremiumGate>
 */
export function PremiumGate({
  feature,
  isPremium,
  isLoading = false,
  onUpgrade,
  children,
  fallback,
}: PremiumGateProps) {
  if (isLoading || isPremium) return <>{children}</>;
  if (fallback) return <>{fallback}</>;

  return (
    <button
      onClick={onUpgrade}
      className="flex items-center gap-2 px-3 py-2 rounded-xl border border-sky-300 bg-sky-50 dark:bg-sky-900/30 dark:border-sky-700 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors w-full text-left"
    >
      <span className="text-sky-500 text-base">✦</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold leading-tight">
          {feature} · Premium
        </div>
        <div className="text-xs opacity-75">Tap to upgrade →</div>
      </div>
    </button>
  );
}

"use client";

import { useState } from "react";
import type { PremiumState } from "../hooks/usePremium";

const PREMIUM_FEATURES = [
  { icon: "✨", label: "AI-generated focus steps", desc: "Smart prep steps from your session intent" },
  { icon: "⏱️", label: "Deep Work 90–180 min", desc: "Extended Guided Deep Work sessions" },
  { icon: "📊", label: "All-time stats & streaks", desc: "Track long-term focus habits" },
  { icon: "📅", label: "Unlimited session history", desc: "Access every session, not just 30 days" },
  { icon: "🖼️", label: "Picture-in-Picture timer", desc: "Float the timer over any window" },
  { icon: "🔊", label: "All tick sounds", desc: "Classic and beep in addition to alternating" },
  { icon: "💾", label: "Export your data", desc: "Download session history as CSV" },
];

interface PaywallModalProps
  extends Pick<
    PremiumState,
    "paywallVisible" | "closePaywall" | "purchasePackage" | "restorePurchases"
  > {}

export function PaywallModal({
  paywallVisible,
  closePaywall,
  purchasePackage,
  restorePurchases,
}: PaywallModalProps) {
  const [purchasing, setPurchasing] = useState<"monthly" | "annual" | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!paywallVisible) return null;

  const handlePurchase = async (plan: "monthly" | "annual") => {
    setError(null);
    setPurchasing(plan);
    try {
      await purchasePackage(plan);
      // purchasePackage redirects on success — if we're still here something went wrong
      setError("Could not start checkout. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Purchase failed. Please try again.");
    } finally {
      setPurchasing(null);
    }
  };

  const handleRestore = async () => {
    setError(null);
    setRestoring(true);
    try {
      await restorePurchases();
      // restorePurchases redirects to the portal — if still here, no customer found
      setError("No subscription found for this account.");
    } catch {
      setError("Could not open billing portal. Please try again.");
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn"
      onClick={closePaywall}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700 animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 pb-4 text-center">
          <button
            onClick={closePaywall}
            className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-lg"
          >
            ✕
          </button>
          <div className="text-6xl mb-3">🍅</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
            FlowMate Premium
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Your history is stored for 30 days on this device.<br />
            Upgrade to keep it forever and sync across devices.
          </p>
        </div>

        {/* Features */}
        <div className="px-6 pb-4">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 space-y-3">
            {PREMIUM_FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="text-xl w-7 text-center">{f.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {f.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    {f.desc}
                  </div>
                </div>
                <span className="text-emerald-500 font-bold text-base">✓</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div className="px-6 pb-2 space-y-3">
          {/* Annual */}
          <button
            onClick={() => handlePurchase("annual")}
            disabled={purchasing !== null}
            className="relative w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white rounded-2xl py-4 px-5 transition-colors"
          >
            <span className="absolute -top-2.5 right-4 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
              Best Value
            </span>
            <div className="font-semibold text-base">Annual</div>
            <div className="font-bold text-xl">
              {purchasing === "annual" ? "Redirecting…" : "$40 / year"}
            </div>
            <div className="text-sky-100 text-xs mt-0.5">$3.33 / month — save 33%</div>
          </button>

          {/* Monthly */}
          <button
            onClick={() => handlePurchase("monthly")}
            disabled={purchasing !== null}
            className="w-full border-2 border-slate-200 dark:border-slate-700 hover:border-sky-400 disabled:opacity-60 rounded-2xl py-4 px-5 transition-colors text-slate-800 dark:text-white"
          >
            <div className="font-semibold text-base">Monthly</div>
            <div className="font-bold text-xl">
              {purchasing === "monthly" ? "Redirecting…" : "$5 / month"}
            </div>
          </button>

          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
        </div>

        {/* Restore + legal */}
        <div className="px-6 pb-8 text-center space-y-2">
          <button
            onClick={handleRestore}
            disabled={restoring}
            className="text-sm text-slate-400 hover:text-slate-600 underline"
          >
            {restoring ? "Opening billing portal…" : "Manage subscription"}
          </button>
          <p className="text-xs text-slate-400">
            Subscription renews automatically. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

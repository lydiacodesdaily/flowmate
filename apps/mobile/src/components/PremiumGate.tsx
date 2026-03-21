import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../theme';
import { usePremium } from '../contexts/PremiumContext';

interface PremiumGateProps {
  /** Short label shown in the upgrade prompt, e.g. "AI steps" */
  feature: string;
  children: React.ReactNode;
  /** Custom fallback — defaults to a compact upgrade prompt */
  fallback?: React.ReactNode;
  /** Render as an inline badge overlay instead of replacing children */
  overlay?: boolean;
}

/**
 * Renders children for premium users, or an upgrade prompt for free users.
 *
 * Usage:
 *   <PremiumGate feature="AI steps">
 *     <GenerateButton />
 *   </PremiumGate>
 */
export function PremiumGate({
  feature,
  children,
  fallback,
  overlay = false,
}: PremiumGateProps) {
  const { isPremium, isLoading, openPaywall } = usePremium();

  if (isLoading || isPremium) return <>{children}</>;

  if (fallback) return <>{fallback}</>;

  if (overlay) {
    return (
      <View style={styles.overlayWrapper}>
        <View style={styles.overlayBlur} pointerEvents="none">
          {children}
        </View>
        <TouchableOpacity style={styles.overlayBadge} onPress={openPaywall}>
          <Text style={styles.overlayBadgeText}>✦ Premium</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <UpgradePrompt feature={feature} onUpgrade={openPaywall} />;
}

function UpgradePrompt({
  feature,
  onUpgrade,
}: {
  feature: string;
  onUpgrade: () => void;
}) {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[
        styles.prompt,
        {
          backgroundColor: theme.colors.primaryLight,
          borderColor: theme.colors.primary,
        },
      ]}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      <Text style={[styles.promptIcon]}>✦</Text>
      <View style={styles.promptText}>
        <Text style={[styles.promptLabel, { color: theme.colors.primary }]}>
          {feature} is a Premium feature
        </Text>
        <Text style={[styles.promptCta, { color: theme.colors.primary }]}>
          Upgrade to unlock →
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  prompt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  promptIcon: {
    fontSize: 18,
    color: '#3FA9F5',
  },
  promptText: { flex: 1 },
  promptLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  promptCta: {
    fontSize: 13,
    marginTop: 2,
    opacity: 0.8,
  },
  overlayWrapper: {
    position: 'relative',
  },
  overlayBlur: {
    opacity: 0.35,
  },
  overlayBadge: {
    position: 'absolute',
    top: '50%',
    alignSelf: 'center',
    backgroundColor: '#3FA9F5',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ translateY: -14 }],
  },
  overlayBadgeText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});

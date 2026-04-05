import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { PACKAGE_TYPE } from 'react-native-purchases';
import type { PurchasesPackage } from 'react-native-purchases';
import { useTheme } from '../theme';
import { usePremium } from '../contexts/PremiumContext';

const PREMIUM_FEATURES = [
  { icon: '⏱', label: 'Deep Work sessions up to 3 hours', free: false },
  { icon: '🔊', label: 'All tick sounds & audio packs', free: false },
  { icon: '📅', label: 'Log past sessions (any date)', free: false },
  { icon: '📊', label: 'All-time stats & streaks', free: false },
  { icon: '📚', label: 'Unlimited session history', free: false },
  { icon: '🕒', label: 'Pomodoro & custom timers', free: true },
  { icon: '📈', label: 'Weekly stats', free: true },
];

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PaywallModal({ visible, onClose }: PaywallModalProps) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { packages, purchasePackage, restorePurchases } = usePremium();

  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Find monthly and annual packages from RC offerings
  const monthlyPackage = packages.find(p => p.packageType === PACKAGE_TYPE.MONTHLY);
  const annualPackage = packages.find(p => p.packageType === PACKAGE_TYPE.ANNUAL);

  // Default to annual (best value) if available
  const activePackage =
    selectedPackage ??
    annualPackage ??
    monthlyPackage ??
    packages[0] ??
    null;

  const handlePurchase = async () => {
    if (!activePackage) return;
    setIsLoading(true);
    setError(null);
    const { error } = await purchasePackage(activePackage);
    setIsLoading(false);
    if (error) setError(error);
  };

  const handleRestore = async () => {
    setIsLoading(true);
    setError(null);
    const { error } = await restorePurchases();
    setIsLoading(false);
    if (error) setError(error);
  };

  const formatPrice = (pkg: PurchasesPackage) => {
    return pkg.product.priceString;
  };

  const getAnnualMonthlyEquivalent = () => {
    if (!annualPackage) return null;
    const annual = annualPackage.product.price;
    const monthly = annual / 12;
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: annualPackage.product.currencyCode,
      minimumFractionDigits: 2,
    });
    return formatter.format(monthly);
  };

  const getSavingsPercent = () => {
    if (!annualPackage || !monthlyPackage) return null;
    const annualMonthly = annualPackage.product.price / 12;
    const monthly = monthlyPackage.product.price;
    const savings = Math.round((1 - annualMonthly / monthly) * 100);
    return savings > 0 ? savings : null;
  };

  const savingsPercent = getSavingsPercent();
  const monthlyEquivalent = getAnnualMonthlyEquivalent();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerSpacer} />
            <TouchableOpacity onPress={onClose} style={styles.closeButton} disabled={isLoading}>
              <Text style={[styles.closeText, { color: theme.colors.textTertiary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Hero */}
          <Text style={styles.heroEmoji}>✦</Text>
          <Text style={[styles.title, { color: theme.colors.text }]}>FlowMate Premium</Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            Go deeper. Focus longer. Track everything.
          </Text>

          {/* Feature list */}
          <View style={[styles.featureList, { backgroundColor: theme.colors.surface }]}>
            {PREMIUM_FEATURES.map((feature, i) => (
              <View
                key={i}
                style={[
                  styles.featureRow,
                  i < PREMIUM_FEATURES.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.border,
                  },
                ]}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={[styles.featureLabel, { color: feature.free ? theme.colors.textSecondary : theme.colors.text }]}>
                  {feature.label}
                </Text>
                <Text
                  style={[
                    styles.featureBadge,
                    { color: feature.free ? theme.colors.textTertiary : theme.colors.primary },
                  ]}
                >
                  {feature.free ? 'Free' : '✦'}
                </Text>
              </View>
            ))}
          </View>

          {/* Plan selection */}
          {packages.length > 0 ? (
            <View style={styles.plans}>
              {annualPackage && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor:
                        activePackage?.identifier === annualPackage.identifier
                          ? theme.colors.primary
                          : theme.colors.border,
                      borderWidth:
                        activePackage?.identifier === annualPackage.identifier ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPackage(annualPackage)}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <View style={styles.planLeft}>
                    {savingsPercent && (
                      <View style={[styles.savingsBadge, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.savingsBadgeText}>{savingsPercent}% off</Text>
                      </View>
                    )}
                    <Text style={[styles.planName, { color: theme.colors.text }]}>Annual</Text>
                    {monthlyEquivalent && (
                      <Text style={[styles.planDetail, { color: theme.colors.textSecondary }]}>
                        {monthlyEquivalent}/month
                      </Text>
                    )}
                  </View>
                  <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                    {formatPrice(annualPackage)}/yr
                  </Text>
                </TouchableOpacity>
              )}

              {monthlyPackage && (
                <TouchableOpacity
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: theme.colors.surface,
                      borderColor:
                        activePackage?.identifier === monthlyPackage.identifier
                          ? theme.colors.primary
                          : theme.colors.border,
                      borderWidth:
                        activePackage?.identifier === monthlyPackage.identifier ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedPackage(monthlyPackage)}
                  activeOpacity={0.85}
                  disabled={isLoading}
                >
                  <Text style={[styles.planName, { color: theme.colors.text }]}>Monthly</Text>
                  <Text style={[styles.planPrice, { color: theme.colors.text }]}>
                    {formatPrice(monthlyPackage)}/mo
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View style={styles.packagesLoading}>
              <ActivityIndicator color={theme.colors.primary} />
            </View>
          )}

          {error && (
            <Text style={[styles.errorText, { color: theme.colors.error ?? '#E53E3E' }]}>
              {error}
            </Text>
          )}

          {/* CTA */}
          <TouchableOpacity
            style={[
              styles.ctaButton,
              {
                backgroundColor: theme.colors.primary,
                opacity: isLoading || !activePackage ? 0.7 : 1,
              },
            ]}
            onPress={handlePurchase}
            activeOpacity={0.85}
            disabled={isLoading || !activePackage}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.ctaButtonText}>Start Premium</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestore}
            disabled={isLoading}
          >
            <Text style={[styles.restoreText, { color: theme.colors.textTertiary }]}>
              Restore purchases
            </Text>
          </TouchableOpacity>

          <Text style={[styles.legal, { color: theme.colors.textTertiary }]}>
            {Platform.OS === 'ios'
              ? 'Payment charged to Apple ID. Subscription renews automatically. Cancel anytime in App Store settings.'
              : 'Payment charged to Google Play account. Cancel anytime in Google Play settings.'}
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  container: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerSpacer: {
    width: 44,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 18,
  },
  heroEmoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 12,
    color: '#F0A500',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 22,
  },
  featureList: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 13,
    gap: 12,
  },
  featureIcon: {
    fontSize: 18,
    width: 28,
    textAlign: 'center',
  },
  featureLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '400',
  },
  featureBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
  plans: {
    gap: 10,
    marginBottom: 20,
  },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 16,
  },
  planLeft: {
    flex: 1,
    gap: 2,
  },
  savingsBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  savingsBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
  },
  planDetail: {
    fontSize: 13,
  },
  planPrice: {
    fontSize: 17,
    fontWeight: '600',
  },
  packagesLoading: {
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaButton: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  restoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
  },
  restoreText: {
    fontSize: 14,
  },
  legal: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

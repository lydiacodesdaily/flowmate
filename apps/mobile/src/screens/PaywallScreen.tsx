import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme';
import { usePremium } from '../contexts/PremiumContext';
import type { PurchasesPackage } from 'react-native-purchases';

const PREMIUM_FEATURES = [
  { icon: '✨', label: 'AI-generated focus steps', desc: 'Smart prep steps from your session intent' },
  { icon: '⏱️', label: 'Deep Work 90–180 min', desc: 'Extended Guided Deep Work sessions' },
  { icon: '📊', label: 'All-time stats & streaks', desc: 'Track your long-term focus habits' },
  { icon: '📅', label: 'Unlimited session history', desc: 'Access every session, not just 30 days' },
  { icon: '🎨', label: 'All 5 timer visuals', desc: 'Radial, bold, gradient, filling styles' },
  { icon: '🎧', label: 'All sensory presets', desc: 'Gentle, minimal, high-alert & custom' },
  { icon: '🔒', label: 'Focus Lock', desc: 'Block distractions during sessions' },
  { icon: '💾', label: 'Export your data', desc: 'Download session history as CSV' },
];

export function PaywallScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { paywallVisible, closePaywall, offerings, purchasePackage, restorePurchases } =
    usePremium();
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);

  const currentOffering = offerings?.current;
  const packages = currentOffering?.availablePackages ?? [];

  const monthlyPkg = packages.find(
    (p) => p.packageType === 'MONTHLY'
  ) as PurchasesPackage | undefined;
  const annualPkg = packages.find(
    (p) => p.packageType === 'ANNUAL'
  ) as PurchasesPackage | undefined;

  const handlePurchase = async (pkg: PurchasesPackage) => {
    setPurchasing(true);
    try {
      const success = await purchasePackage(pkg);
      if (success) closePaywall();
    } catch (e: any) {
      Alert.alert('Purchase failed', e?.message ?? 'Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const success = await restorePurchases();
      if (success) {
        closePaywall();
      } else {
        Alert.alert('No purchases found', 'No active subscription was found for this account.');
      }
    } catch {
      Alert.alert('Restore failed', 'Please try again.');
    } finally {
      setRestoring(false);
    }
  };

  const s = styles(theme);

  return (
    <Modal
      visible={paywallVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={closePaywall}
    >
      <View style={[s.container, { paddingTop: insets.top + 8 }]}>
        {/* Close */}
        <TouchableOpacity style={s.closeButton} onPress={closePaywall}>
          <Text style={s.closeText}>✕</Text>
        </TouchableOpacity>

        <ScrollView
          style={s.scroll}
          contentContainerStyle={[s.scrollContent, { paddingBottom: insets.bottom + 24 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Text style={s.tomato}>🍅</Text>
          <Text style={s.title}>FlowMate Premium</Text>
          <Text style={s.subtitle}>Unlock your full focus potential</Text>

          {/* Feature list */}
          <View style={s.featureList}>
            {PREMIUM_FEATURES.map((f) => (
              <View key={f.label} style={s.featureRow}>
                <Text style={s.featureIcon}>{f.icon}</Text>
                <View style={s.featureText}>
                  <Text style={s.featureLabel}>{f.label}</Text>
                  <Text style={s.featureDesc}>{f.desc}</Text>
                </View>
                <Text style={s.checkmark}>✓</Text>
              </View>
            ))}
          </View>

          {/* Pricing */}
          <View style={s.pricingSection}>
            {annualPkg && (
              <TouchableOpacity
                style={[s.priceButton, s.priceButtonPrimary]}
                onPress={() => handlePurchase(annualPkg)}
                disabled={purchasing}
              >
                <View style={s.bestValueBadge}>
                  <Text style={s.bestValueText}>BEST VALUE</Text>
                </View>
                <Text style={s.priceButtonLabel}>Annual</Text>
                <Text style={s.priceButtonPrice}>
                  {annualPkg.product.priceString} / year
                </Text>
                <Text style={s.priceButtonSaving}>
                  {annualPkg.product.introPrice
                    ? annualPkg.product.introPrice.priceString + ' first year'
                    : 'Save vs monthly'}
                </Text>
              </TouchableOpacity>
            )}

            {monthlyPkg && (
              <TouchableOpacity
                style={s.priceButton}
                onPress={() => handlePurchase(monthlyPkg)}
                disabled={purchasing}
              >
                <Text style={s.priceButtonLabel}>Monthly</Text>
                <Text style={s.priceButtonPrice}>
                  {monthlyPkg.product.priceString} / month
                </Text>
              </TouchableOpacity>
            )}

            {!annualPkg && !monthlyPkg && (
              <View style={s.noOfferings}>
                <Text style={s.noOfferingsText}>Loading pricing…</Text>
                <ActivityIndicator color={theme.colors.primary} />
              </View>
            )}

            {purchasing && (
              <ActivityIndicator
                style={{ marginTop: 12 }}
                color={theme.colors.primary}
              />
            )}
          </View>

          {/* Restore */}
          <TouchableOpacity
            onPress={handleRestore}
            disabled={restoring}
            style={s.restoreButton}
          >
            {restoring ? (
              <ActivityIndicator color={theme.colors.textTertiary} />
            ) : (
              <Text style={s.restoreText}>Restore purchases</Text>
            )}
          </TouchableOpacity>

          <Text style={s.legal}>
            Subscription renews automatically. Cancel anytime in your App Store settings.
          </Text>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = (theme: ReturnType<typeof useTheme>['theme']) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    closeButton: {
      alignSelf: 'flex-end',
      marginRight: 20,
      marginBottom: 4,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.colors.surfaceSecondary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closeText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    scroll: { flex: 1 },
    scrollContent: {
      paddingHorizontal: 24,
      alignItems: 'center',
    },
    tomato: {
      fontSize: 64,
      marginBottom: 8,
      marginTop: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 28,
    },
    featureList: {
      width: '100%',
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: 16,
      marginBottom: 24,
      gap: 14,
    },
    featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    featureIcon: {
      fontSize: 20,
      width: 28,
      textAlign: 'center',
    },
    featureText: { flex: 1 },
    featureLabel: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.colors.text,
    },
    featureDesc: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      marginTop: 1,
    },
    checkmark: {
      fontSize: 16,
      color: theme.colors.success,
      fontWeight: '700',
    },
    pricingSection: {
      width: '100%',
      gap: 12,
      marginBottom: 16,
    },
    priceButton: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1.5,
      borderColor: theme.colors.border,
      borderRadius: 16,
      padding: 18,
      alignItems: 'center',
      position: 'relative',
    },
    priceButtonPrimary: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    bestValueBadge: {
      position: 'absolute',
      top: -10,
      right: 16,
      backgroundColor: theme.colors.success,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    bestValueText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#fff',
      letterSpacing: 0.5,
    },
    priceButtonLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: '#fff',
      marginBottom: 2,
    },
    priceButtonPrice: {
      fontSize: 20,
      fontWeight: '700',
      color: '#fff',
    },
    priceButtonSaving: {
      fontSize: 13,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    noOfferings: {
      alignItems: 'center',
      padding: 20,
      gap: 12,
    },
    noOfferingsText: {
      color: theme.colors.textSecondary,
      fontSize: 15,
    },
    restoreButton: {
      paddingVertical: 12,
      paddingHorizontal: 24,
    },
    restoreText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textDecorationLine: 'underline',
    },
    legal: {
      fontSize: 11,
      color: theme.colors.textTertiary,
      textAlign: 'center',
      marginTop: 8,
      paddingHorizontal: 16,
    },
  });

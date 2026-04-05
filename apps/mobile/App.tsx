import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

// Cap font scaling globally at 1.3x for accessibility without breaking layouts
(Text as any).defaultProps = (Text as any).defaultProps || {};
(Text as any).defaultProps.maxFontSizeMultiplier = 1.3;
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import {
  TimerProvider,
  AccessibilityProvider,
  TimerDisplaySettingsProvider,
  TimerVisualProvider,
  CelebrationSettingsProvider,
  ReviewPromptProvider,
  AuthProvider,
  PremiumProvider,
  usePremium,
} from './src/contexts';
import { FloatingTimerMini } from './src/components/FloatingTimerMini';
import { AuthModal } from './src/components/AuthModal';
import { PaywallModal } from './src/components/PaywallModal';
import { hasCompletedOnboarding } from './src/utils/storage';

// Modals are mounted at the root so they can be triggered from anywhere in the tree
function RootModals() {
  const { paywallVisible, hidePaywall, authVisible, hideAuth } = usePremium();
  return (
    <>
      <AuthModal visible={authVisible} onClose={hideAuth} />
      <PaywallModal visible={paywallVisible} onClose={hidePaywall} />
    </>
  );
}

function NavigationContent() {
  return (
    <>
      <RootNavigator />
      <FloatingTimerMini />
    </>
  );
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    hasCompletedOnboarding().then(completed => {
      setShowOnboarding(!completed);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return (
      <NavigationContainer>
        <OnboardingNavigator onComplete={() => setShowOnboarding(false)} />
      </NavigationContainer>
    );
  }

  return <>{children}</>;
}

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <OnboardingGate>
      <NavigationContainer>
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <NavigationContent />
          <RootModals />
        </View>
      </NavigationContainer>
    </OnboardingGate>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <TimerDisplaySettingsProvider>
            <TimerVisualProvider>
              <CelebrationSettingsProvider>
                <ReviewPromptProvider>
                  <TimerProvider>
                    <AuthProvider>
                      <PremiumProvider>
                        <AppContent />
                      </PremiumProvider>
                    </AuthProvider>
                  </TimerProvider>
                </ReviewPromptProvider>
              </CelebrationSettingsProvider>
            </TimerVisualProvider>
          </TimerDisplaySettingsProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

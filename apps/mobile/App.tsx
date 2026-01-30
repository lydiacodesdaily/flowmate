import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
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
} from './src/contexts';
import { FloatingTimerMini } from './src/components/FloatingTimerMini';
import { hasCompletedOnboarding } from './src/utils/storage';

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
                <TimerProvider>
                  <AppContent />
                </TimerProvider>
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

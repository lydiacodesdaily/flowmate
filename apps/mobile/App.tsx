import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ThemeProvider, useTheme } from './src/theme';
import { TimerProvider, AccessibilityProvider } from './src/contexts';
import { FloatingTimerMini } from './src/components/FloatingTimerMini';

function NavigationContent() {
  return (
    <>
      <RootNavigator />
      <FloatingTimerMini />
    </>
  );
}

function AppContent() {
  const { theme, isDark } = useTheme();

  return (
    <NavigationContainer>
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <NavigationContent />
      </View>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AccessibilityProvider>
          <TimerProvider>
            <AppContent />
          </TimerProvider>
        </AccessibilityProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

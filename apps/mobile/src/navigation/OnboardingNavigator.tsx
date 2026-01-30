import React, { useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  OnboardingWelcome,
  OnboardingSensoryProfile,
  OnboardingTimerVisual,
} from '../components/onboarding';
import {
  markOnboardingCompleted,
  saveSensoryPresetSettings,
  saveTimerVisualSettings,
} from '../utils/storage';
import type { SensoryPresetId, TimerVisualStyle } from '../utils/storage';
import { useAccessibility } from '../contexts';

type OnboardingStackParamList = {
  Welcome: undefined;
  SensoryProfile: undefined;
  TimerVisual: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

interface OnboardingNavigatorProps {
  onComplete: () => void;
}

export function OnboardingNavigator({ onComplete }: OnboardingNavigatorProps) {
  // Track user selections during onboarding
  const [selectedPreset, setSelectedPreset] = useState<SensoryPresetId>('full');
  const [selectedVisual, setSelectedVisual] = useState<TimerVisualStyle>('thin');
  const { reduceMotion } = useAccessibility();

  const handleSkip = async () => {
    // Apply defaults and complete onboarding
    await saveSensoryPresetSettings({ selectedPreset: 'full' });
    await saveTimerVisualSettings({ selectedStyle: 'thin' });
    await markOnboardingCompleted();
    onComplete();
  };

  const handleComplete = async () => {
    // Save user's selections
    await saveSensoryPresetSettings({ selectedPreset });
    await saveTimerVisualSettings({ selectedStyle: selectedVisual });
    await markOnboardingCompleted();
    onComplete();
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: reduceMotion ? 'none' : 'slide_from_right',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Welcome">
        {({ navigation }) => (
          <OnboardingWelcome
            onNext={() => navigation.navigate('SensoryProfile')}
            onSkip={handleSkip}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="SensoryProfile">
        {({ navigation }) => (
          <OnboardingSensoryProfile
            selectedPreset={selectedPreset}
            onPresetChange={setSelectedPreset}
            onNext={() => navigation.navigate('TimerVisual')}
            onBack={() => navigation.goBack()}
            onSkip={handleSkip}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="TimerVisual">
        {({ navigation }) => (
          <OnboardingTimerVisual
            selectedStyle={selectedVisual}
            onStyleChange={setSelectedVisual}
            onComplete={handleComplete}
            onBack={() => navigation.goBack()}
            onSkip={handleSkip}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

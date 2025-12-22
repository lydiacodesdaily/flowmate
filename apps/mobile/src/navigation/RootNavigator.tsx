import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';
import { ModeSelectionScreen } from '../components/ModeSelectionScreen';
import { PomodoroSelectionScreen } from '../components/PomodoroSelectionScreen';
import { GuidedSelectionScreen } from '../components/GuidedSelectionScreen';
import { CustomTimerSelectionScreen } from '../components/CustomTimerSelectionScreen';
import { ActiveTimer } from '../components/ActiveTimer';
import { StatsScreen } from '../screens/StatsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="ModeSelection"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: '#FAFAFA' },
      }}
    >
      <Stack.Screen name="ModeSelection" component={ModeSelectionScreen} />
      <Stack.Screen name="PomodoroSelection" component={PomodoroSelectionScreen} />
      <Stack.Screen name="GuidedSelection" component={GuidedSelectionScreen} />
      <Stack.Screen name="CustomSelection" component={CustomTimerSelectionScreen} />
      <Stack.Screen
        name="ActiveTimer"
        component={ActiveTimer}
        options={{
          gestureEnabled: false, // Prevent swipe back during active timer
        }}
      />
      <Stack.Screen name="Stats" component={StatsScreen} />
    </Stack.Navigator>
  );
}

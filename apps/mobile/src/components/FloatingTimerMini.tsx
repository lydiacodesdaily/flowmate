import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
  GestureResponderEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NavigationProp } from '@react-navigation/native';
import { useTimerContext } from '../contexts/TimerContext';
import { useTheme } from '../theme/ThemeContext';
import type { TabParamList, FocusStackParamList } from '../navigation/types';

type RootNavigationProp = NavigationProp<TabParamList>;

export function FloatingTimerMini() {
  const navigation = useNavigation<RootNavigationProp>();
  const { isActive, currentPhase, formattedTime, status, pause, resume, sessions } = useTimerContext();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(100)).current; // Start below screen

  // Animate in/out based on isActive
  useEffect(() => {
    if (isActive) {
      // Slide up
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide down
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isActive, slideAnim]);

  if (!isActive) return null;

  const handlePress = () => {
    // Navigate to ActiveTimer screen in FocusTab with sessions parameter
    navigation.navigate('FocusTab', {
      screen: 'ActiveTimer',
      params: { sessions },
    } as any);
  };

  const handleTogglePlayPause = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (status === 'running') {
      pause();
    } else if (status === 'paused') {
      resume();
    }
  };

  // Get phase display info
  const getPhaseDisplay = () => {
    switch (currentPhase) {
      case 'focus':
        return { icon: '🕒', label: 'Focus Session' };
      case 'break':
        return { icon: '☕', label: 'Break Time' };
      case 'settle':
        return { icon: '🧘', label: 'Settle In' };
      case 'wrap':
        return { icon: '✨', label: 'Wrap Up' };
      default:
        return { icon: '⏱', label: 'Session' };
    }
  };

  const phaseDisplay = getPhaseDisplay();
  const isPaused = status === 'paused';

  // Tab bar height (64) + bottom inset + spacing above
  const tabBarHeight = 64 + insets.bottom;
  const bottomOffset = tabBarHeight + 4; // 8px spacing above tab bar

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          bottom: bottomOffset,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      {/* Whole bar is tappable - navigates to timer */}
      <TouchableOpacity
        onPress={handlePress}
        style={styles.mainArea}
        activeOpacity={0.7}
      >
        <View style={styles.leftSection}>
          <Text style={styles.icon}>{phaseDisplay.icon}</Text>
          <Text style={[styles.phaseLabel, { color: theme.colors.textSecondary }]}>
            {phaseDisplay.label}
          </Text>
        </View>
        <Text
          style={[
            styles.time,
            { color: theme.colors.text },
            isPaused && styles.timePaused,
          ]}
        >
          {formattedTime}
        </Text>
      </TouchableOpacity>

      {/* Pause/Resume button - secondary action */}
      <TouchableOpacity
        onPress={handleTogglePlayPause}
        style={[styles.controlButton, { borderColor: theme.colors.border }]}
        activeOpacity={0.6}
      >
        <Text style={styles.controlIcon}>{isPaused ? '▶️' : '⏸'}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderTopWidth: 0.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  mainArea: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingRight: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 20,
  },
  phaseLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  time: {
    fontSize: 17,
    fontWeight: '400',
    fontVariant: ['tabular-nums'],
    letterSpacing: 0.5,
  },
  timePaused: {
    opacity: 0.6,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlIcon: {
    fontSize: 16,
  },
});

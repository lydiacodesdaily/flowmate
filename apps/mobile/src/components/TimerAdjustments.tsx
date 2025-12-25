import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface TimerAdjustmentsProps {
  onAddTime: () => void;
  onSubtractTime: () => void;
  onAddPomodoro?: () => void;
  onRemovePomodoro?: () => void;
  disabled?: boolean;
  canRemovePomodoro?: boolean;
  showPomodoroControls?: boolean;
}

export function TimerAdjustments({
  onAddTime,
  onSubtractTime,
  onAddPomodoro,
  onRemovePomodoro,
  disabled = false,
  canRemovePomodoro = true,
  showPomodoroControls = false,
}: TimerAdjustmentsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      {/* Time adjustments */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.button}
          onPress={onSubtractTime}
          disabled={disabled}
          activeOpacity={0.6}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textTertiary }, disabled && styles.disabled]}>
            − 5m
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={onAddTime}
          disabled={disabled}
          activeOpacity={0.6}
        >
          <Text style={[styles.buttonText, { color: theme.colors.textTertiary }, disabled && styles.disabled]}>
            + 5m
          </Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      {showPomodoroControls && (
        <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
      )}

      {/* Pomodoro adjustments */}
      {showPomodoroControls && (
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.button}
            onPress={onRemovePomodoro}
            disabled={disabled || !canRemovePomodoro}
            activeOpacity={0.6}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textTertiary }, (disabled || !canRemovePomodoro) && styles.disabled]}>
              − pom
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={onAddPomodoro}
            disabled={disabled}
            activeOpacity={0.6}
          >
            <Text style={[styles.buttonText, { color: theme.colors.textTertiary }, disabled && styles.disabled]}>
              + pom
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  section: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  disabled: {
    opacity: 0.25,
  },
  divider: {
    width: 1,
    height: 16,
    opacity: 0.3,
  },
});

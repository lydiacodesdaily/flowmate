import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme';

interface PomodoroAdjustControlsProps {
  onAddPomodoro: () => void;
  onRemovePomodoro: () => void;
  disabled?: boolean;
  canRemove: boolean;
}

export function PomodoroAdjustControls({
  onAddPomodoro,
  onRemovePomodoro,
  disabled = false,
  canRemove = true,
}: PomodoroAdjustControlsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: theme.colors.textTertiary }]}>
        pomodoros
      </Text>
      <View style={styles.controls}>
        <TouchableOpacity
          onPress={onRemovePomodoro}
          disabled={disabled || !canRemove}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: disabled || !canRemove ? 0.3 : 1,
            }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>−</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onAddPomodoro}
          disabled={disabled}
          style={[
            styles.button,
            {
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              opacity: disabled ? 0.3 : 1,
            }
          ]}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, { color: theme.colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: '300',
    marginBottom: 12,
    letterSpacing: 0.8,
  },
  controls: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 28,
  },
});

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface TimerAdjustControlsProps {
  onAddTime: () => void;
  onSubtractTime: () => void;
  disabled?: boolean;
}

export function TimerAdjustControls({
  onAddTime,
  onSubtractTime,
  disabled = false,
}: TimerAdjustControlsProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.adjustButton,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
          disabled && { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary },
        ]}
        onPress={onSubtractTime}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.adjustIcon, { color: theme.colors.primary }, disabled && { color: theme.colors.textTertiary }]}>−</Text>
        <Text style={[styles.adjustLabel, { color: theme.colors.primary }, disabled && { color: theme.colors.textTertiary }]}>5 min</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.adjustButton,
          { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary },
          disabled && { borderColor: theme.colors.border, backgroundColor: theme.colors.surfaceSecondary },
        ]}
        onPress={onAddTime}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.adjustIcon, { color: theme.colors.primary }, disabled && { color: theme.colors.textTertiary }]}>+</Text>
        <Text style={[styles.adjustLabel, { color: theme.colors.primary }, disabled && { color: theme.colors.textTertiary }]}>5 min</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 16,
  },
  adjustButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  adjustIcon: {
    fontSize: 24,
    fontWeight: '700',
  },
  adjustLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
});

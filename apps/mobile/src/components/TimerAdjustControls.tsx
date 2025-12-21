import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

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
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.adjustButton, disabled && styles.disabled]}
        onPress={onSubtractTime}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.adjustIcon, disabled && styles.disabledText]}>−</Text>
        <Text style={[styles.adjustLabel, disabled && styles.disabledText]}>5 min</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.adjustButton, disabled && styles.disabled]}
        onPress={onAddTime}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.adjustIcon, disabled && styles.disabledText]}>+</Text>
        <Text style={[styles.adjustLabel, disabled && styles.disabledText]}>5 min</Text>
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
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E94B3C',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    gap: 6,
  },
  disabled: {
    borderColor: '#D0D0D0',
    backgroundColor: '#F5F5F5',
  },
  adjustIcon: {
    fontSize: 24,
    fontWeight: '700',
    color: '#E94B3C',
  },
  adjustLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#E94B3C',
  },
  disabledText: {
    color: '#999',
  },
});

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

interface AudioControlsProps {
  muteAll: boolean;
  muteDuringBreaks: boolean;
  onToggleMuteAll: () => void;
  onToggleMuteDuringBreaks: () => void;
}

export function AudioControls({
  muteAll,
  muteDuringBreaks,
  onToggleMuteAll,
  onToggleMuteDuringBreaks,
}: AudioControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.controlButton, muteAll && styles.activeButton]}
        onPress={onToggleMuteAll}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>{muteAll ? '🔇' : '🔊'}</Text>
        <Text style={[styles.label, muteAll && styles.activeLabel]}>
          {muteAll ? 'Audio Off' : 'Audio On'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.controlButton,
          muteDuringBreaks && styles.activeButton,
          muteAll && styles.disabled,
        ]}
        onPress={onToggleMuteDuringBreaks}
        disabled={muteAll}
        activeOpacity={0.7}
      >
        <Text style={styles.icon}>☕</Text>
        <Text
          style={[
            styles.label,
            muteDuringBreaks && styles.activeLabel,
            muteAll && styles.disabledText,
          ]}
        >
          {muteDuringBreaks ? 'Muted in Breaks' : 'Sound in Breaks'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 8,
  },
  activeButton: {
    borderColor: '#E94B3C',
    backgroundColor: '#FFF5F4',
  },
  disabled: {
    borderColor: '#E0E0E0',
    backgroundColor: '#F5F5F5',
  },
  icon: {
    fontSize: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  activeLabel: {
    color: '#E94B3C',
  },
  disabledText: {
    color: '#999',
  },
});

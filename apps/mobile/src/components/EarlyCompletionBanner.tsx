import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface EarlyCompletionBannerProps {
  onEndEarly: () => void;
  onDismiss: () => void;
}

export function EarlyCompletionBanner({ onEndEarly, onDismiss }: EarlyCompletionBannerProps) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.surfaceSecondary }]}>
      <Text style={[styles.message, { color: theme.colors.text }]}>
        All steps complete!
      </Text>
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onDismiss}
          style={styles.dismissButton}
          activeOpacity={0.7}
        >
          <Text style={[styles.dismissText, { color: theme.colors.textTertiary }]}>
            Keep going
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onEndEarly}
          style={[styles.endButton, { backgroundColor: theme.colors.primary }]}
          activeOpacity={0.7}
        >
          <Text style={styles.endText}>
            End session
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  message: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dismissButton: {
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  dismissText: {
    fontSize: 12,
    fontWeight: '500',
  },
  endButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  endText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

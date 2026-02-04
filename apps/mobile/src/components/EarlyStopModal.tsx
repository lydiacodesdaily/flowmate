import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useResponsive } from '../hooks/useResponsive';
import { useAccessibility } from '../contexts';

interface EarlyStopModalProps {
  visible: boolean;
  onContinue: () => void;
  onStop: () => void;
}

export function EarlyStopModal({ visible, onContinue, onStop }: EarlyStopModalProps) {
  const { theme } = useTheme();
  const { isTablet } = useResponsive();
  const { reduceMotion } = useAccessibility();

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'fade'}
      transparent={true}
      onRequestClose={onContinue}
    >
      <Pressable style={styles.backdrop} onPress={onContinue}>
        <View style={styles.backdropOverlay} />
      </Pressable>

      <View style={styles.centeredContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }, isTablet && { maxWidth: 400 }]}>
          {/* Warning Icon */}
          <Text style={styles.emoji}>⏸️</Text>

          {/* Title */}
          <Text style={[styles.title, { color: theme.colors.text }]}>
            End session early?
          </Text>

          {/* Description */}
          <Text style={[styles.description, { color: theme.colors.textSecondary }]}>
            Your progress won't be saved if you stop now.
          </Text>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onContinue}
              style={[styles.button, styles.continueButton, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.continueButtonText}>Keep Going</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onStop}
              style={[styles.button, styles.stopButton, { borderColor: theme.colors.border }]}
            >
              <Text style={[styles.stopButtonText, { color: theme.colors.textSecondary }]}>
                End Session
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  backdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  centeredContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    width: '100%',
    maxWidth: 320,
    borderRadius: 24,
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  continueButton: {
    // Primary action - keep going
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  stopButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

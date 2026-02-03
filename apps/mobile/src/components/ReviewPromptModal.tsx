import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAccessibility } from '../contexts';

interface ReviewPromptModalProps {
  visible: boolean;
  onLeaveReview: () => void;
  onDismiss: () => void;
}

export function ReviewPromptModal({
  visible,
  onLeaveReview,
  onDismiss,
}: ReviewPromptModalProps) {
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();

  return (
    <Modal
      visible={visible}
      animationType={reduceMotion ? 'none' : 'fade'}
      transparent={true}
      onRequestClose={onDismiss}
    >
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <View style={styles.backdropOverlay} />
      </Pressable>

      <View style={styles.centeredContainer}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <Text style={styles.emoji}>💙</Text>

          <Text style={[styles.title, { color: theme.colors.text }]}>
            Enjoying FlowMate?
          </Text>

          <Text style={[styles.body, { color: theme.colors.textSecondary }]}>
            If FlowMate has been helping, a quick review supports this project.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onLeaveReview}
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
              accessibilityRole="button"
              accessibilityLabel="Leave a review"
            >
              <Text style={styles.primaryButtonText}>Leave a review</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onDismiss}
              style={[styles.secondaryButton, { backgroundColor: theme.colors.surfaceSecondary }]}
              accessibilityRole="button"
              accessibilityLabel="Not now"
            >
              <Text style={[styles.secondaryButtonText, { color: theme.colors.textSecondary }]}>
                Not now
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
    paddingHorizontal: 24,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 28,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
  secondaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
  },
});

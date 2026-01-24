import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { useAccessibility } from '../contexts';

interface WelcomeModalProps {
  visible: boolean;
  onDismiss: () => void;
}

interface TipItemProps {
  icon: string;
  title: string;
  description: string;
  textColor: string;
  secondaryColor: string;
}

function TipItem({ icon, title, description, textColor, secondaryColor }: TipItemProps) {
  return (
    <View style={styles.tipItem}>
      <Text style={styles.tipIcon}>{icon}</Text>
      <View style={styles.tipContent}>
        <Text style={[styles.tipTitle, { color: textColor }]}>{title}</Text>
        <Text style={[styles.tipDescription, { color: secondaryColor }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

export function WelcomeModal({ visible, onDismiss }: WelcomeModalProps) {
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
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.emoji}>🎧</Text>

            <Text style={[styles.title, { color: theme.colors.text }]}>
              Welcome to FlowMate
            </Text>

            <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
              Quick tips to get the most out of your sessions
            </Text>

            <View style={styles.tipsContainer}>
              <TipItem
                icon="🎚️"
                title="Audio Presets"
                description="Choose from Silent, Minimal, Balanced, or Full — or customize everything. Tap the ⋯ menu during a timer."
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />

              <TipItem
                icon="🎵"
                title="Works With Your Music"
                description="Ticks play softly over your music. Announcements briefly lower the volume so you can hear them clearly."
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />

              <TipItem
                icon="🔒"
                title="Background Audio"
                description="Audio continues when your screen is locked or you switch apps."
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />

              <TipItem
                icon="💡"
                title="Finding Your Setup"
                description="Everyone experiences time blindness differently. Some prefer every-minute announcements, others want just ticking. There's no &quot;correct&quot; setup — try adjusting cue types and volumes to find what clicks for you."
                textColor={theme.colors.text}
                secondaryColor={theme.colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              onPress={onDismiss}
              style={[styles.button, { backgroundColor: theme.colors.primary }]}
            >
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </ScrollView>
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
    maxWidth: 340,
    maxHeight: '85%',
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  scrollContent: {
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    alignItems: 'center',
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
  subtitle: {
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 24,
  },
  tipsContainer: {
    width: '100%',
    gap: 20,
    marginBottom: 28,
  },
  tipItem: {
    flexDirection: 'row',
    gap: 12,
  },
  tipIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  tipDescription: {
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '600',
  },
});

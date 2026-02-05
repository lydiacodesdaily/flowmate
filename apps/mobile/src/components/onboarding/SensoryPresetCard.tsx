import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '../../theme';
import { SensoryPreset } from '../../constants/sensoryPresets';
import { hapticService } from '../../services/hapticService';
import { createAudioPlayer } from 'expo-audio';

interface SensoryPresetCardProps {
  preset: SensoryPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function SensoryPresetCard({ preset, isSelected, onSelect }: SensoryPresetCardProps) {
  const { theme } = useTheme();
  const pulseAnim = useRef(new Animated.Value(0)).current;

  const playVisualPulse = () => {
    pulseAnim.setValue(1);
    Animated.timing(pulseAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: false,
    }).start();
  };

  const playPreview = async () => {
    // Play haptic if preset has haptics enabled
    if (preset.config.haptics) {
      await hapticService.light();
    }

    // Play tick sound preview if preset has tick sound
    if (preset.config.tickSound !== 'none') {
      try {
        let soundFile;
        switch (preset.config.tickSound) {
          case 'alternating':
            soundFile = require('../../../assets/audio/effects/tick1.mp3');
            break;
          case 'classic':
            soundFile = require('../../../assets/audio/effects/tick.m4a');
            break;
          case 'beep':
            soundFile = require('../../../assets/audio/effects/beep.wav');
            break;
        }

        if (soundFile) {
          const player = createAudioPlayer(soundFile);
          player.volume = preset.config.tickVolume;
          player.play();
          setTimeout(() => player.remove(), 1000);
        }
      } catch (error) {
        console.error('Failed to play preview sound:', error);
      }
    }

    // Play voice sample for presets that rely on announcements but have no tick
    if (preset.config.announcements && preset.config.tickSound === 'none') {
      try {
        const voiceSample = require('../../../assets/audio/countdown/minutes/m05.mp3');
        const player = createAudioPlayer(voiceSample);
        player.volume = preset.config.announcementVolume;
        player.play();
        setTimeout(() => player.remove(), 3000);
      } catch (error) {
        console.error('Failed to play voice preview:', error);
      }
    }

    // Visual pulse for presets with no tick sound and no haptics
    if (preset.config.tickSound === 'none' && !preset.config.haptics) {
      playVisualPulse();
    }
  };

  const handlePress = () => {
    playPreview();
    onSelect();
  };

  const pulseBackground = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', theme.colors.primary + '30'],
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.7}
      style={[
        styles.card,
        {
          backgroundColor: isSelected ? theme.colors.primary + '15' : theme.colors.surface,
          borderColor: isSelected ? theme.colors.primary : theme.colors.border,
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.pulseOverlay, { backgroundColor: pulseBackground }]}
        pointerEvents="none"
      />
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{preset.icon}</Text>
      </View>
      <View style={styles.content}>
        <Text
          style={[
            styles.name,
            {
              color: isSelected ? theme.colors.primary : theme.colors.text,
              fontWeight: isSelected ? '600' : '500',
            },
          ]}
        >
          {preset.name}
        </Text>
        <Text
          style={[
            styles.description,
            { color: theme.colors.textSecondary },
          ]}
          numberOfLines={1}
        >
          {preset.description}
        </Text>
      </View>
      {isSelected && (
        <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
          <Text allowFontScaling={false} style={styles.checkmarkText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden' as const,
  },
  pulseOverlay: {
    borderRadius: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  checkmarkText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

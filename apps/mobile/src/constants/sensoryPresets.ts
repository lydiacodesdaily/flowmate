import type { SensoryPresetId } from '../utils/storage';

export interface SensoryPresetConfig {
  tickSound: 'alternating' | 'classic' | 'beep' | 'none';
  tickVolume: number;
  announcements: boolean;
  announcementVolume: number;
  announcementInterval: 1 | 5 | 10;
  secondsCountdown: boolean;
  haptics: boolean;
  // Transition warning settings
  transitionWarning: boolean;
  transitionChime: boolean;
}

export interface SensoryPreset {
  id: SensoryPresetId;
  name: string;
  description: string;
  icon: string;
  config: SensoryPresetConfig;
}

export const SENSORY_PRESETS: SensoryPreset[] = [
  {
    id: 'full',
    name: 'Full',
    description: 'All feedback enabled',
    icon: '🔊',
    config: {
      tickSound: 'alternating',
      tickVolume: 0.5,
      announcements: true,
      announcementVolume: 0.7,
      announcementInterval: 1,
      secondsCountdown: true,
      haptics: true,
      transitionWarning: true,
      transitionChime: false, // Seconds countdown already provides audio cues
    },
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Softer, less frequent cues',
    icon: '🔉',
    config: {
      tickSound: 'classic',
      tickVolume: 0.3,
      announcements: true,
      announcementVolume: 0.5,
      announcementInterval: 5,
      secondsCountdown: false,
      haptics: true,
      transitionWarning: true,
      transitionChime: true, // Chime enabled since no seconds countdown
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Essential cues only',
    icon: '🔈',
    config: {
      tickSound: 'none',
      tickVolume: 0,
      announcements: true,
      announcementVolume: 0.5,
      announcementInterval: 10,
      secondsCountdown: false,
      haptics: false,
      transitionWarning: true, // Visual only
      transitionChime: false,
    },
  },
  {
    id: 'silent',
    name: 'Silent',
    description: 'No audio or haptic feedback',
    icon: '🔇',
    config: {
      tickSound: 'none',
      tickVolume: 0,
      announcements: false,
      announcementVolume: 0,
      announcementInterval: 1,
      secondsCountdown: false,
      haptics: false,
      transitionWarning: true, // Visual warning still useful
      transitionChime: false,
    },
  },
  {
    id: 'highAlert',
    name: 'High Alert',
    description: 'Maximum feedback for staying engaged',
    icon: '📢',
    config: {
      tickSound: 'beep',
      tickVolume: 0.8,
      announcements: true,
      announcementVolume: 1.0,
      announcementInterval: 1,
      secondsCountdown: true,
      haptics: true,
      transitionWarning: true,
      transitionChime: false, // Seconds countdown already provides audio cues
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Your personalized settings',
    icon: '🎨',
    config: {
      tickSound: 'alternating',
      tickVolume: 0.5,
      announcements: true,
      announcementVolume: 0.7,
      announcementInterval: 5,
      secondsCountdown: false,
      haptics: true,
      transitionWarning: true,
      transitionChime: true, // Chime enabled since no seconds countdown
    },
  },
];

export function getPresetById(id: SensoryPresetId): SensoryPreset | undefined {
  return SENSORY_PRESETS.find(preset => preset.id === id);
}

export function getPresetConfig(id: SensoryPresetId): SensoryPresetConfig {
  const preset = getPresetById(id);
  return preset?.config ?? SENSORY_PRESETS[0].config;
}

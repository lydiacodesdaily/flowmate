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
    description: 'Ticks + voice every minute + countdown',
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
      transitionChime: false,
    },
  },
  {
    id: 'gentle',
    name: 'Gentle',
    description: 'Soft ticks, voice every 5 min',
    icon: '🔉',
    config: {
      tickSound: 'alternating',
      tickVolume: 0.3,
      announcements: true,
      announcementVolume: 0.5,
      announcementInterval: 5,
      secondsCountdown: false,
      haptics: true,
      transitionWarning: true,
      transitionChime: true,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Voice only, every 10 min',
    icon: '🔈',
    config: {
      tickSound: 'none',
      tickVolume: 0,
      announcements: true,
      announcementVolume: 0.5,
      announcementInterval: 10,
      secondsCountdown: false,
      haptics: false,
      transitionWarning: true,
      transitionChime: false,
    },
  },
  {
    id: 'transitions',
    name: 'Transitions',
    description: 'Session start/end only',
    icon: '🔔',
    config: {
      tickSound: 'none',
      tickVolume: 0,
      announcements: false,
      announcementVolume: 0,
      announcementInterval: 10,
      secondsCountdown: false,
      haptics: false,
      transitionWarning: true,
      transitionChime: true,
    },
  },
  {
    id: 'silent',
    name: 'Silent',
    description: 'Visual only, no audio or vibration',
    icon: '🔇',
    config: {
      tickSound: 'none',
      tickVolume: 0,
      announcements: false,
      announcementVolume: 0,
      announcementInterval: 1,
      secondsCountdown: false,
      haptics: false,
      transitionWarning: true,
      transitionChime: false,
    },
  },
  {
    id: 'highAlert',
    name: 'High Alert',
    description: 'Loud beeps, voice every minute + countdown',
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
      transitionChime: false,
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
      transitionChime: true,
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

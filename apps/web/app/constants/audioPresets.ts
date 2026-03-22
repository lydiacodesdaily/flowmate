export type AudioPresetId = 'full' | 'gentle' | 'minimal' | 'transitions' | 'silent' | 'custom';

export interface AudioPresetConfig {
  tickVolume: number;
  tickSound: string;
  announcementVolume: number;
  transitionVolume: number;
  minuteAnnouncementInterval: number;
  enableFinalCountdown: boolean;
  enableDingCheckpoints: boolean;
  enableTransitionSounds: boolean;
  muteBreak: boolean;
}

export interface AudioPreset {
  id: AudioPresetId;
  name: string;
  icon: string;
  description: string;
  config: AudioPresetConfig;
}

export const AUDIO_PRESETS: AudioPreset[] = [
  {
    id: 'full',
    name: 'Full',
    icon: '🔊',
    description: 'Ticks + voice every minute + countdown',
    config: {
      tickVolume: 0.15,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0.5,
      transitionVolume: 0.5,
      minuteAnnouncementInterval: 1,
      enableFinalCountdown: true,
      enableDingCheckpoints: true,
      enableTransitionSounds: true,
      muteBreak: false,
    },
  },
  {
    id: 'gentle',
    name: 'Gentle',
    icon: '🔉',
    description: 'Soft ticks, voice every 5 min',
    config: {
      tickVolume: 0.05,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0.35,
      transitionVolume: 0.35,
      minuteAnnouncementInterval: 5,
      enableFinalCountdown: false,
      enableDingCheckpoints: true,
      enableTransitionSounds: true,
      muteBreak: false,
    },
  },
  {
    id: 'minimal',
    name: 'Minimal',
    icon: '🔈',
    description: 'Voice only, every 10 min',
    config: {
      tickVolume: 0,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0.35,
      transitionVolume: 0.35,
      minuteAnnouncementInterval: 10,
      enableFinalCountdown: false,
      enableDingCheckpoints: false,
      enableTransitionSounds: true,
      muteBreak: false,
    },
  },
  {
    id: 'transitions',
    name: 'Transitions',
    icon: '🔔',
    description: 'Session start/end only',
    config: {
      tickVolume: 0,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0,
      transitionVolume: 0.25,
      minuteAnnouncementInterval: 10,
      enableFinalCountdown: false,
      enableDingCheckpoints: false,
      enableTransitionSounds: true,
      muteBreak: false,
    },
  },
  {
    id: 'silent',
    name: 'Silent',
    icon: '🔇',
    description: 'No audio',
    config: {
      tickVolume: 0,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0,
      transitionVolume: 0.25,
      minuteAnnouncementInterval: 1,
      enableFinalCountdown: false,
      enableDingCheckpoints: false,
      enableTransitionSounds: false,
      muteBreak: false,
    },
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: '🎨',
    description: 'Your settings',
    config: {
      tickVolume: 0.05,
      tickSound: 'tick-tok-alternate.mp3',
      announcementVolume: 0.35,
      transitionVolume: 0.35,
      minuteAnnouncementInterval: 5,
      enableFinalCountdown: false,
      enableDingCheckpoints: true,
      enableTransitionSounds: true,
      muteBreak: false,
    },
  },
];

export function getPresetById(id: string): AudioPreset | undefined {
  return AUDIO_PRESETS.find(p => p.id === id);
}

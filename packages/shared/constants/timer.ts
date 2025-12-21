import type { PomodoroType, GuidedType, Session } from '../types';

// Pomodoro session configurations
export const POMODORO_CONFIGS: Record<PomodoroType, Session[]> = {
  '1pom': [
    { type: 'focus', durationMinutes: 25 }
  ],
  '2pom': [
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 }
  ],
  '3pom': [
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 }
  ],
  '5pom': [
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 }
  ]
};

// Guided Deep Work session configurations
export const GUIDED_CONFIGS: Record<GuidedType, Session[]> = {
  // Pomodoro style (with settles and wraps)
  'guided-30-pom': [
    { type: 'settle', durationMinutes: 3 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'wrap', durationMinutes: 2 }
  ],
  'guided-60-pom': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 20 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-90-pom': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 20 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-120-pom': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 20 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-180-pom': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 20 },
    { type: 'wrap', durationMinutes: 5 }
  ],

  // Deep Focus style (longer uninterrupted blocks)
  'guided-30-deep': [
    { type: 'settle', durationMinutes: 3 },
    { type: 'focus', durationMinutes: 25 },
    { type: 'wrap', durationMinutes: 2 }
  ],
  'guided-60-deep': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 50 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-90-deep': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 80 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-120-deep': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 50 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 55 },
    { type: 'wrap', durationMinutes: 5 }
  ],
  'guided-180-deep': [
    { type: 'settle', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 50 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 50 },
    { type: 'break', durationMinutes: 5 },
    { type: 'focus', durationMinutes: 60 },
    { type: 'wrap', durationMinutes: 5 }
  ]
};

// Default audio settings
export const DEFAULT_AUDIO_SETTINGS = {
  tickVolume: 0.5,
  announcementVolume: 0.8,
  tickSound: 'alternating' as const,
  muteAll: false,
  muteDuringBreaks: false,
  announcementInterval: 1 as const
};

// Default UI settings
export const DEFAULT_UI_SETTINGS = {
  darkMode: false
};

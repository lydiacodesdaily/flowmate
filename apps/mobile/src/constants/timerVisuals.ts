import type { TimerVisualStyle } from '../utils/storage';

export interface TimerVisualPreset {
  id: TimerVisualStyle;
  name: string;
  description: string;
  icon: string;
}

export const TIMER_VISUAL_PRESETS: TimerVisualPreset[] = [
  {
    id: 'thin',
    name: 'Minimal',
    description: 'Subtle progress bar that stays out of the way',
    icon: '━',
  },
  {
    id: 'circular',
    name: 'Radial',
    description: 'Circular countdown, great for time perception',
    icon: '◐',
  },
  {
    id: 'thick',
    name: 'Bold',
    description: 'Prominent progress bar, easy to see at a glance',
    icon: '▬',
  },
  {
    id: 'gradient',
    name: 'Color Flow',
    description: 'Changes color as time passes (green to red)',
    icon: '🌈',
  },
  {
    id: 'filling',
    name: 'Hourglass',
    description: 'Visual metaphor of time draining away',
    icon: '⏳',
  },
];

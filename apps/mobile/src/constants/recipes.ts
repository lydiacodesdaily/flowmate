import type { GuidedType } from '@flowmate/shared';

export interface FocusRecipe {
  id: string;
  name: string;
  description: string;
  icon: string;
  duration: number; // total minutes
  guidedType: GuidedType;
}

export const FOCUS_RECIPES: FocusRecipe[] = [
  {
    id: 'quick-sprint',
    name: 'Quick Sprint',
    description: 'Fast, focused burst',
    icon: '⚡',
    duration: 30,
    guidedType: 'guided-30-pom',
  },
  {
    id: 'steady-pace',
    name: 'Steady Pace',
    description: 'Balanced focus with breaks',
    icon: '🚶',
    duration: 60,
    guidedType: 'guided-60-pom',
  },
  {
    id: 'deep-dive',
    name: 'Deep Dive',
    description: 'Extended uninterrupted focus',
    icon: '🌊',
    duration: 60,
    guidedType: 'guided-60-deep',
  },
  {
    id: 'marathon',
    name: 'Marathon',
    description: 'Long session with regular breaks',
    icon: '🏃',
    duration: 90,
    guidedType: 'guided-90-pom',
  },
  {
    id: 'flow-state',
    name: 'Flow State',
    description: 'Deep work, minimal interruption',
    icon: '🧘',
    duration: 90,
    guidedType: 'guided-90-deep',
  },
];

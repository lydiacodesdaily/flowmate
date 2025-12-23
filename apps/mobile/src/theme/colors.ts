import type { Theme } from './types';

export const lightTheme: Theme = {
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    border: '#EBEBF0',
    text: '#3A3A3C',
    textSecondary: '#666666',
    textTertiary: '#8E8E93',
    primary: '#E94B3C',
    primaryLight: '#FFE5E2',
    success: '#34C759',
    warning: '#FF9500',
    error: '#FF3B30',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },
  isDark: false,
};

export const darkTheme: Theme = {
  colors: {
    background: '#000000',
    surface: '#1C1C1E',
    surfaceSecondary: '#2C2C2E',
    border: '#38383A',
    text: '#FFFFFF',
    textSecondary: '#EBEBF5',
    textTertiary: '#8E8E93',
    primary: '#FF6B5E',
    primaryLight: '#3A2A28',
    success: '#30D158',
    warning: '#FF9F0A',
    error: '#FF453A',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  isDark: true,
};

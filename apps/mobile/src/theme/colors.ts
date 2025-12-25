import type { Theme } from './types';

export const lightTheme: Theme = {
  colors: {
    background: '#FAFAFA',
    surface: '#FFFFFF',
    surfaceSecondary: '#F5F5F5',
    border: '#E6E6E6',
    text: '#2E2E2E',
    textSecondary: '#707075', // Updated for WCAG AA compliance (4.5:1 on white)
    textTertiary: '#707075', // Updated for WCAG AA compliance (4.5:1 on white)
    primary: '#3FA9F5',
    primaryLight: '#EAF5FF',
    success: '#4CAF8F',
    warning: '#FF9500',
    error: '#E94B4B',
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
    textTertiary: '#AEAEB3', // Updated for WCAG AA compliance (4.5:1 on dark backgrounds)
    primary: '#3FA9F5',
    primaryLight: '#1E4A6B',
    success: '#4CAF8F',
    warning: '#FF9F0A',
    error: '#E94B4B',
    overlay: 'rgba(0, 0, 0, 0.75)',
  },
  isDark: true,
};

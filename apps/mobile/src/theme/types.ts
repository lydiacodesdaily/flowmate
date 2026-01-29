export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  colors: {
    background: string;
    surface: string;
    surfaceSecondary: string;
    border: string;
    text: string;
    textSecondary: string;
    textTertiary: string;
    primary: string;
    primaryLight: string;
    success: string;
    warning: string;
    error: string;
    overlay: string;
    // Break session colors for visual distinction
    breakBackground: string;
    breakAccent: string;
    // Transition warning colors - amber tones for "wrapping up" phase
    transitionBackground: string;
    transitionAccent: string;
  };
  isDark: boolean;
}

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

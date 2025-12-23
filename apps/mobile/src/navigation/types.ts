import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { Session } from '@flowmate/shared';

// Focus Stack - contains all focus mode related screens
export type FocusStackParamList = {
  ModeSelection: undefined;
  PomodoroSelection: undefined;
  GuidedSelection: undefined;
  CustomSelection: undefined;
  ActiveTimer: { sessions: Session[] };
};

// Bottom Tab Navigator
export type TabParamList = {
  FocusTab: undefined;
  StatsTab: undefined;
  SettingsTab: undefined;
};

// Root Stack (wraps the tabs)
export type RootStackParamList = {
  MainTabs: undefined;
};

// Focus Stack Screen Props
export type ModeSelectionScreenProps = NativeStackScreenProps<
  FocusStackParamList,
  'ModeSelection'
>;

export type PomodoroSelectionScreenProps = NativeStackScreenProps<
  FocusStackParamList,
  'PomodoroSelection'
>;

export type GuidedSelectionScreenProps = NativeStackScreenProps<
  FocusStackParamList,
  'GuidedSelection'
>;

export type CustomSelectionScreenProps = NativeStackScreenProps<
  FocusStackParamList,
  'CustomSelection'
>;

export type ActiveTimerScreenProps = NativeStackScreenProps<
  FocusStackParamList,
  'ActiveTimer'
>;

// Tab Screen Props
export type FocusTabScreenProps = BottomTabScreenProps<TabParamList, 'FocusTab'>;
export type StatsScreenProps = BottomTabScreenProps<TabParamList, 'StatsTab'>;
export type SettingsScreenProps = BottomTabScreenProps<TabParamList, 'SettingsTab'>;

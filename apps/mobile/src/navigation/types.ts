import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { Session } from '@flowmate/shared';

export type RootStackParamList = {
  ModeSelection: undefined;
  PomodoroSelection: undefined;
  GuidedSelection: undefined;
  CustomSelection: undefined;
  ActiveTimer: { sessions: Session[] };
  Stats: undefined;
  Settings: undefined;
};

export type ModeSelectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ModeSelection'
>;

export type PomodoroSelectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'PomodoroSelection'
>;

export type GuidedSelectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'GuidedSelection'
>;

export type CustomSelectionScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CustomSelection'
>;

export type ActiveTimerScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'ActiveTimer'
>;

export type StatsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Stats'
>;

export type SettingsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Settings'
>;

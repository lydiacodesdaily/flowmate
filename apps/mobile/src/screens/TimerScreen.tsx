import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import type { TimerMode, Session } from '@flowmate/shared';
import { ModeSelectionScreen } from '../components/ModeSelectionScreen';
import { PomodoroSelectionScreen } from '../components/PomodoroSelectionScreen';
import { GuidedSelectionScreen } from '../components/GuidedSelectionScreen';
import { CustomTimerSelectionScreen } from '../components/CustomTimerSelectionScreen';
import { ActiveTimer } from '../components/ActiveTimer';
import { StatsScreen } from './StatsScreen';

type Screen = 'mode-select' | 'pomodoro-select' | 'guided-select' | 'custom-select' | 'timer' | 'stats';

export function TimerScreen() {
  const [screen, setScreen] = useState<Screen>('mode-select');
  const [mode, setMode] = useState<TimerMode | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const handleModeSelect = (selectedMode: TimerMode) => {
    setMode(selectedMode);
    if (selectedMode === 'pomodoro') {
      setScreen('pomodoro-select');
    } else if (selectedMode === 'guided') {
      setScreen('guided-select');
    } else {
      setScreen('custom-select');
    }
  };

  const handlePomodoroConfig = (_type: unknown, selectedSessions: Session[]) => {
    setSessions(selectedSessions);
    setScreen('timer');
  };

  const handleGuidedConfig = (_type: unknown, selectedSessions: Session[]) => {
    setSessions(selectedSessions);
    setScreen('timer');
  };

  const handleCustomConfig = (selectedSessions: Session[]) => {
    setSessions(selectedSessions);
    setScreen('timer');
  };

  const handleBack = () => {
    setScreen('mode-select');
    setMode(null);
    setSessions([]);
  };

  const handleViewStats = () => {
    setScreen('stats');
  };

  const handleStatsBack = () => {
    setScreen('mode-select');
  };

  return (
    <View style={styles.container}>
      {screen === 'mode-select' && (
        <ModeSelectionScreen
          onSelectMode={handleModeSelect}
          onViewStats={handleViewStats}
        />
      )}

      {screen === 'pomodoro-select' && (
        <PomodoroSelectionScreen
          onSelectConfig={handlePomodoroConfig}
          onBack={handleBack}
        />
      )}

      {screen === 'guided-select' && (
        <GuidedSelectionScreen
          onSelectConfig={handleGuidedConfig}
          onBack={handleBack}
        />
      )}

      {screen === 'custom-select' && (
        <CustomTimerSelectionScreen
          onSelectConfig={handleCustomConfig}
          onBack={handleBack}
        />
      )}

      {screen === 'timer' && (
        <ActiveTimer sessions={sessions} onBack={handleBack} />
      )}

      {screen === 'stats' && (
        <StatsScreen onBack={handleStatsBack} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
});

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TimerVisualSettings,
  TimerVisualStyle,
  loadTimerVisualSettings,
  saveTimerVisualSettings,
  getDefaultTimerVisualSettings,
} from '../utils/storage';

interface TimerVisualContextType {
  selectedStyle: TimerVisualStyle;
  selectStyle: (style: TimerVisualStyle) => Promise<void>;
  isLoading: boolean;
}

const TimerVisualContext = createContext<TimerVisualContextType | undefined>(undefined);

interface TimerVisualProviderProps {
  children: ReactNode;
}

export function TimerVisualProvider({ children }: TimerVisualProviderProps) {
  const [settings, setSettings] = useState<TimerVisualSettings>(getDefaultTimerVisualSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadTimerVisualSettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load timer visual settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectStyle = async (style: TimerVisualStyle) => {
    const newSettings = { ...settings, selectedStyle: style };
    setSettings(newSettings);
    await saveTimerVisualSettings(newSettings);
  };

  return (
    <TimerVisualContext.Provider
      value={{
        selectedStyle: settings.selectedStyle,
        selectStyle,
        isLoading,
      }}
    >
      {children}
    </TimerVisualContext.Provider>
  );
}

export function useTimerVisual(): TimerVisualContextType {
  const context = useContext(TimerVisualContext);
  if (context === undefined) {
    throw new Error('useTimerVisual must be used within a TimerVisualProvider');
  }
  return context;
}

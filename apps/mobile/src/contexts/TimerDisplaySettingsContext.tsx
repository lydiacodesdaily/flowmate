import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  TimerDisplaySettings,
  loadTimerDisplaySettings,
  saveTimerDisplaySettings,
  getDefaultTimerDisplaySettings,
} from '../utils/storage';

interface TimerDisplaySettingsContextType {
  showElapsedTime: boolean;
  setShowElapsedTime: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const TimerDisplaySettingsContext = createContext<TimerDisplaySettingsContextType | undefined>(undefined);

interface TimerDisplaySettingsProviderProps {
  children: ReactNode;
}

export function TimerDisplaySettingsProvider({ children }: TimerDisplaySettingsProviderProps) {
  const [settings, setSettings] = useState<TimerDisplaySettings>(getDefaultTimerDisplaySettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadTimerDisplaySettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load timer display settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setShowElapsedTime = async (enabled: boolean) => {
    const newSettings = { ...settings, showElapsedTime: enabled };
    setSettings(newSettings);
    await saveTimerDisplaySettings(newSettings);
  };

  return (
    <TimerDisplaySettingsContext.Provider
      value={{
        showElapsedTime: settings.showElapsedTime,
        setShowElapsedTime,
        isLoading,
      }}
    >
      {children}
    </TimerDisplaySettingsContext.Provider>
  );
}

export function useTimerDisplaySettings(): TimerDisplaySettingsContextType {
  const context = useContext(TimerDisplaySettingsContext);
  if (context === undefined) {
    throw new Error('useTimerDisplaySettings must be used within a TimerDisplaySettingsProvider');
  }
  return context;
}

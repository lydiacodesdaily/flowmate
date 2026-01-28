import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  CelebrationSettings,
  loadCelebrationSettings,
  saveCelebrationSettings,
  getDefaultCelebrationSettings,
} from '../utils/storage';

interface CelebrationSettingsContextType {
  confettiEnabled: boolean;
  setConfettiEnabled: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const CelebrationSettingsContext = createContext<CelebrationSettingsContextType | undefined>(undefined);

interface CelebrationSettingsProviderProps {
  children: ReactNode;
}

export function CelebrationSettingsProvider({ children }: CelebrationSettingsProviderProps) {
  const [settings, setSettings] = useState<CelebrationSettings>(getDefaultCelebrationSettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadCelebrationSettings();
      setSettings(loaded);
    } catch (error) {
      console.error('Failed to load celebration settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setConfettiEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, confettiEnabled: enabled };
    setSettings(newSettings);
    await saveCelebrationSettings(newSettings);
  };

  return (
    <CelebrationSettingsContext.Provider
      value={{
        confettiEnabled: settings.confettiEnabled,
        setConfettiEnabled,
        isLoading,
      }}
    >
      {children}
    </CelebrationSettingsContext.Provider>
  );
}

export function useCelebrationSettings(): CelebrationSettingsContextType {
  const context = useContext(CelebrationSettingsContext);
  if (context === undefined) {
    throw new Error('useCelebrationSettings must be used within a CelebrationSettingsProvider');
  }
  return context;
}

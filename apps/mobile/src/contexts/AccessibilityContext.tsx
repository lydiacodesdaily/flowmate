import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  AccessibilitySettings,
  loadAccessibilitySettings,
  saveAccessibilitySettings,
  getDefaultAccessibilitySettings,
} from '../utils/storage';
import { hapticService } from '../services/hapticService';

interface AccessibilityContextType {
  reduceMotion: boolean;
  hapticsEnabled: boolean;
  skipFocusPrompt: boolean;
  setReduceMotion: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setSkipFocusPrompt: (enabled: boolean) => Promise<void>;
  isLoading: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(getDefaultAccessibilitySettings());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const loaded = await loadAccessibilitySettings();
      setSettings(loaded);
      // Sync haptic service with loaded settings
      hapticService.setEnabled(loaded.hapticsEnabled);
    } catch (error) {
      console.error('Failed to load accessibility settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setReduceMotion = async (enabled: boolean) => {
    const newSettings = { ...settings, reduceMotion: enabled };
    setSettings(newSettings);
    await saveAccessibilitySettings(newSettings);
  };

  const setHapticsEnabled = async (enabled: boolean) => {
    const newSettings = { ...settings, hapticsEnabled: enabled };
    setSettings(newSettings);
    hapticService.setEnabled(enabled);
    await saveAccessibilitySettings(newSettings);
  };

  const setSkipFocusPrompt = async (enabled: boolean) => {
    const newSettings = { ...settings, skipFocusPrompt: enabled };
    setSettings(newSettings);
    await saveAccessibilitySettings(newSettings);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        reduceMotion: settings.reduceMotion,
        hapticsEnabled: settings.hapticsEnabled,
        skipFocusPrompt: settings.skipFocusPrompt,
        setReduceMotion,
        setHapticsEnabled,
        setSkipFocusPrompt,
        isLoading,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility(): AccessibilityContextType {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
}

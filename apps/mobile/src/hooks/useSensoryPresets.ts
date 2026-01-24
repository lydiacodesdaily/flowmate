import { useState, useEffect, useCallback } from 'react';
import {
  loadSensoryPresetSettings,
  saveSensoryPresetSettings,
  type SensoryPresetId,
} from '../utils/storage';
import { getPresetConfig, type SensoryPresetConfig } from '../constants/sensoryPresets';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

export function useSensoryPresets() {
  const [selectedPreset, setSelectedPreset] = useState<SensoryPresetId>('full');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preset on mount
  useEffect(() => {
    const load = async () => {
      const settings = await loadSensoryPresetSettings();
      setSelectedPreset(settings.selectedPreset);
      setIsLoading(false);
    };
    load();
  }, []);

  // Apply preset configuration to services
  const applyPreset = useCallback((config: SensoryPresetConfig) => {
    // Apply audio settings
    audioService.updateSettings({
      tickSound: config.tickSound === 'none' ? 'alternating' : config.tickSound,
      tickVolume: config.tickVolume,
      announcementVolume: config.announcementVolume,
      announcementInterval: config.announcementInterval,
      secondsCountdown: config.secondsCountdown,
      muteAll: config.tickSound === 'none' && !config.announcements,
    });

    // Apply haptic setting
    hapticService.setEnabled(config.haptics);
  }, []);

  // Change preset and persist
  const selectPreset = useCallback(async (presetId: SensoryPresetId) => {
    setSelectedPreset(presetId);
    await saveSensoryPresetSettings({ selectedPreset: presetId });

    // Apply the preset configuration
    const config = getPresetConfig(presetId);
    applyPreset(config);
  }, [applyPreset]);

  return {
    selectedPreset,
    selectPreset,
    isLoading,
  };
}

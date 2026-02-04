import { useState, useEffect, useCallback } from 'react';
import {
  loadSensoryPresetSettings,
  saveSensoryPresetSettings,
  getDefaultCustomSensoryConfig,
  type SensoryPresetId,
  type CustomSensoryConfig,
} from '../utils/storage';
import { getPresetConfig, type SensoryPresetConfig } from '../constants/sensoryPresets';
import { audioService } from '../services/audioService';
import { hapticService } from '../services/hapticService';

export function useSensoryPresets() {
  const [selectedPreset, setSelectedPreset] = useState<SensoryPresetId>('gentle');
  const [customConfig, setCustomConfig] = useState<CustomSensoryConfig>(getDefaultCustomSensoryConfig());
  const [isLoading, setIsLoading] = useState(true);

  // Load saved preset and custom config on mount
  useEffect(() => {
    const load = async () => {
      const settings = await loadSensoryPresetSettings();
      setSelectedPreset(settings.selectedPreset);
      if (settings.customConfig) {
        setCustomConfig(settings.customConfig);
      }
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
  const selectPreset = useCallback(async (presetId: SensoryPresetId, newCustomConfig?: CustomSensoryConfig) => {
    setSelectedPreset(presetId);

    const configToSave = newCustomConfig || customConfig;
    await saveSensoryPresetSettings({
      selectedPreset: presetId,
      customConfig: configToSave,
    });

    // Apply the preset configuration
    if (presetId === 'custom') {
      applyPreset(configToSave);
    } else {
      const config = getPresetConfig(presetId);
      applyPreset(config);
    }
  }, [applyPreset, customConfig]);

  // Update custom config and persist
  const updateCustomConfig = useCallback(async (newConfig: CustomSensoryConfig) => {
    setCustomConfig(newConfig);
    await saveSensoryPresetSettings({
      selectedPreset: selectedPreset,
      customConfig: newConfig,
    });

    // If custom preset is active, apply immediately
    if (selectedPreset === 'custom') {
      applyPreset(newConfig);
    }
  }, [applyPreset, selectedPreset]);

  // Get the active configuration (either from preset or custom)
  const getActiveConfig = useCallback((): SensoryPresetConfig => {
    if (selectedPreset === 'custom') {
      return customConfig;
    }
    return getPresetConfig(selectedPreset);
  }, [selectedPreset, customConfig]);

  return {
    selectedPreset,
    selectPreset,
    customConfig,
    updateCustomConfig,
    getActiveConfig,
    isLoading,
  };
}

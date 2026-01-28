import { useState, useEffect, useCallback } from 'react';
import {
  loadTimerDisplaySettings,
  saveTimerDisplaySettings,
} from '../utils/storage';

export function useTimerDisplaySettings() {
  const [showElapsedTime, setShowElapsedTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const settings = await loadTimerDisplaySettings();
      setShowElapsedTime(settings.showElapsedTime);
      setIsLoading(false);
    };
    load();
  }, []);

  const setShowElapsed = useCallback(async (value: boolean) => {
    setShowElapsedTime(value);
    await saveTimerDisplaySettings({ showElapsedTime: value });
  }, []);

  return { showElapsedTime, setShowElapsedTime: setShowElapsed, isLoading };
}

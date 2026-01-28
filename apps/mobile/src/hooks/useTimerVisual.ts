import { useState, useEffect, useCallback } from 'react';
import {
  loadTimerVisualSettings,
  saveTimerVisualSettings,
  type TimerVisualStyle,
} from '../utils/storage';

export function useTimerVisual() {
  const [selectedStyle, setSelectedStyle] = useState<TimerVisualStyle>('thin');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const settings = await loadTimerVisualSettings();
      setSelectedStyle(settings.selectedStyle);
      setIsLoading(false);
    };
    load();
  }, []);

  const selectStyle = useCallback(async (style: TimerVisualStyle) => {
    setSelectedStyle(style);
    await saveTimerVisualSettings({ selectedStyle: style });
  }, []);

  return { selectedStyle, selectStyle, isLoading };
}

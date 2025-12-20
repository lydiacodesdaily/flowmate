import { useEffect } from 'react';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';

/**
 * Hook to keep the screen awake while the timer is running
 * Automatically activates when mounted and deactivates when unmounted
 */
export function useKeepAwake(isActive: boolean = true) {
  useEffect(() => {
    if (isActive) {
      activateKeepAwakeAsync();
      return () => {
        deactivateKeepAwake();
      };
    }
  }, [isActive]);
}

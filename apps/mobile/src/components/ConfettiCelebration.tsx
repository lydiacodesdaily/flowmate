import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import ConfettiCannon from 'react-native-confetti-cannon';
import { useAccessibility, useCelebrationSettings } from '../contexts';

interface ConfettiCelebrationProps {
  trigger: boolean;
  onComplete?: () => void;
}

// Soft, calm colors - not too bright or flashy
const CONFETTI_COLORS = [
  '#06b6d4', // cyan (primary)
  '#67e8f9', // light cyan
  '#a5f3fc', // lighter cyan
  '#f0abfc', // soft purple
  '#fcd34d', // soft gold
  '#86efac', // soft green
];

export function ConfettiCelebration({ trigger, onComplete }: ConfettiCelebrationProps) {
  const [shouldShow, setShouldShow] = useState(false);
  const { confettiEnabled } = useCelebrationSettings();
  const { reduceMotion } = useAccessibility();

  useEffect(() => {
    if (trigger && confettiEnabled && !reduceMotion) {
      setShouldShow(true);
    } else if (trigger && (reduceMotion || !confettiEnabled)) {
      // Still call onComplete even when skipping animation
      onComplete?.();
    }
  }, [trigger, confettiEnabled, reduceMotion]);

  if (!shouldShow || !confettiEnabled || reduceMotion) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <ConfettiCannon
        count={60}
        origin={{ x: -10, y: 0 }}
        autoStart
        fadeOut
        fallSpeed={2500}
        explosionSpeed={300}
        colors={CONFETTI_COLORS}
        onAnimationEnd={() => {
          setShouldShow(false);
          onComplete?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
  },
});

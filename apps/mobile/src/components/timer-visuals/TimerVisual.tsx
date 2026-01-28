import React from 'react';
import { useAccessibility, useTimerVisual } from '../../contexts';
import { ThinProgressBar } from './ThinProgressBar';
import { CircularTimer } from './CircularTimer';
import { ThickProgressBar } from './ThickProgressBar';
import { ColorGradientBar } from './ColorGradientBar';
import { FillingContainer } from './FillingContainer';

interface TimerVisualSwitchProps {
  progress: number;
  isBreakSession: boolean;
}

export function TimerVisual({ progress, isBreakSession }: TimerVisualSwitchProps) {
  const { selectedStyle, isLoading } = useTimerVisual();
  const { reduceMotion } = useAccessibility();

  const props = { progress, isBreakSession, reduceMotion };

  // Default to thin while loading
  if (isLoading) {
    return <ThinProgressBar {...props} />;
  }

  switch (selectedStyle) {
    case 'circular':
      return <CircularTimer {...props} />;
    case 'thick':
      return <ThickProgressBar {...props} />;
    case 'gradient':
      return <ColorGradientBar {...props} />;
    case 'filling':
      return <FillingContainer {...props} />;
    case 'thin':
    default:
      return <ThinProgressBar {...props} />;
  }
}

// Audio file paths for minutes (1-24)
export const MINUTE_AUDIO_FILES = Array.from({ length: 24 }, (_, i) => {
  const minute = i + 1;
  return `m${minute.toString().padStart(2, '0')}`;
});

// Audio file paths for seconds (10, 20, 30, 40, 50)
export const SECOND_INTERVAL_AUDIO_FILES = [10, 20, 30, 40, 50].map(s => `s${s}`);

// Audio file paths for countdown (1-9)
export const COUNTDOWN_AUDIO_FILES = Array.from({ length: 9 }, (_, i) => {
  const second = i + 1;
  return `s${second.toString().padStart(2, '0')}`;
});

// Transition audio files
export const TRANSITION_AUDIO_FILES = {
  focus: 'focus',
  break: 'break',
  done: 'done'
};

// Effect audio files
export const EFFECT_AUDIO_FILES = {
  ding: 'ding',
  tick: 'tick',
  tick1: 'tick1',
  tok1: 'tok1'
};

// Audio file path builders
export const getMinuteAudioPath = (minutes: number): string =>
  `/audio/countdown/minutes/m${minutes.toString().padStart(2, '0')}.mp3`;

export const getSecondAudioPath = (seconds: number): string =>
  `/audio/countdown/seconds/s${seconds.toString().padStart(2, '0')}.mp3`;

export const getTransitionAudioPath = (type: 'focus' | 'break' | 'done'): string =>
  `/audio/countdown/transitions/${type}.mp3`;

export const getEffectAudioPath = (effect: 'ding' | 'tick' | 'tick1' | 'tok1'): string => {
  const extension = effect === 'tick' ? 'm4a' : 'mp3';
  return `/audio/effects/${effect}.${extension}`;
};

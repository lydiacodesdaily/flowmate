import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer, InterruptionMode } from 'expo-audio';
import type { AudioSettings, SessionType } from '@flowmate/shared';
import { AppState, Platform } from 'react-native';
import type { AppStateStatus } from 'react-native';
import { loadAudioSettings, saveAudioSettings } from '../utils/storage';

/**
 * Helper to set audio mode with platform-specific handling for interruptionMode.
 * Works around expo-audio bug on Android where interruptionMode string causes crash.
 * See: https://github.com/expo/expo/issues/34025
 */
async function setAudioModeWithInterruption(
  options: {
    playsInSilentMode?: boolean;
    shouldPlayInBackground?: boolean;
    interruptionMode: InterruptionMode;
  }
) {
  // Android: skip setAudioModeAsync entirely for per-announcement calls.
  // Calling it repeatedly (fire-and-forget from the tick loop) corrupts the
  // Android audio session after multiple sessions, silently breaking all
  // announcements while ticks keep playing. The mode is already set correctly
  // in initialize() and needs no further changes. On Android the
  // interruptionMode enum also causes a crash (expo-audio bug #34025), so
  // there is nothing useful this call could do anyway.
  if (Platform.OS !== 'ios') return;

  await setAudioModeAsync({
    playsInSilentMode: options.playsInSilentMode,
    shouldPlayInBackground: options.shouldPlayInBackground,
    interruptionMode: options.interruptionMode,
  });
}

/**
 * Callbacks for tick loop - uses getters to read current values without React dependencies
 */
export interface TickLoopCallbacks {
  /** Returns current time remaining in seconds (derived from Date.now and endTime) */
  getTimeRemaining: () => number;
  /** Returns total session duration in seconds */
  getTotalTime: () => number;
  /** Returns current session type for mute-during-breaks logic */
  getSessionType: () => SessionType | null;
  /** Called on minute boundary crossings */
  onHapticLight: () => void;
  /** Called for transition warning haptics (double-tap at 60s and 30s) */
  onTransitionHaptic?: () => void;
}

class AudioService {
  private tickSound: AudioPlayer | null = null;
  private alternateTickSound: AudioPlayer | null = null;
  private dingSound: AudioPlayer | null = null;
  private transitionSounds: Map<string, AudioPlayer> = new Map();
  private minuteAnnouncements: Map<number, AudioPlayer> = new Map();
  private secondAnnouncements: Map<number, AudioPlayer> = new Map();
  private isAlternate = false;
  private appStateSubscription: any = null;

  // Tick loop state - audioService owns timing, independent of React
  private tickLoopInterval: NodeJS.Timeout | null = null;
  private tickLoopCallbacks: TickLoopCallbacks | null = null;
  private lastTickedSecond: number = -1;
  private lastAnnouncedMinute: number = -1;
  private lastAnnouncedSecond: number = -1;

  // Transition warning state
  private transitionWarningTriggered60: boolean = false;
  private transitionWarningTriggered30: boolean = false;
  private transitionChimeSound: AudioPlayer | null = null;

  private settings: AudioSettings & { transitionWarningEnabled: boolean; transitionChimeEnabled: boolean } = {
    tickVolume: 0.5,
    announcementVolume: 0.7,
    tickSound: 'alternating',
    muteAll: false,
    muteDuringBreaks: false,
    announcementInterval: 1,
    secondsCountdown: true,
    transitionWarningEnabled: true,
    transitionChimeEnabled: false,
  };

  async initialize() {
    try {
      // Load saved settings from storage
      const savedSettings = await loadAudioSettings();
      this.settings = {
        tickVolume: savedSettings.tickVolume,
        announcementVolume: savedSettings.announcementVolume,
        tickSound: savedSettings.tickSound,
        muteAll: savedSettings.muteAll,
        muteDuringBreaks: savedSettings.muteDuringBreaks,
        announcementInterval: savedSettings.announcementInterval,
        secondsCountdown: savedSettings.secondsCountdown ?? true,
        transitionWarningEnabled: true, // Default enabled
        transitionChimeEnabled: false, // Default disabled (seconds countdown handles audio)
      };

      // Set audio mode for background playback and mixing with other apps.
      // Use mixWithOthers so ticks overlay music without ducking it. Announcements
      // will temporarily switch to duckOthers on their own calls (they are rare).
      await setAudioModeWithInterruption({
        playsInSilentMode: true,
        // Allow audio to continue playing in background
        shouldPlayInBackground: true,
        // Mix with other apps (like music players) without ducking
        interruptionMode: 'mixWithOthers',
      });

      // Listen for app state changes to handle background/foreground transitions
      this.appStateSubscription = AppState.addEventListener('change', this.handleAppStateChange);
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  private handleAppStateChange = async (nextAppState: AppStateStatus) => {
    // Reactivate audio session for both foreground and background states
    try {
      await setAudioModeWithInterruption({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'mixWithOthers',
      });
      console.log(`Audio session reactivated (state: ${nextAppState})`);
    } catch (error) {
      console.error('Failed to reactivate audio session:', error);
    }
  };

  async loadTickSounds() {
    try {
      // Load sounds based on tick sound setting
      if (this.settings.tickSound === 'alternating') {
        // Alternating mode: use tick1.mp3 and tok1.mp3
        const tick1 = createAudioPlayer(require('../../assets/audio/effects/tick1.mp3'), {
          keepAudioSessionActive: true,
        });
        tick1.volume = this.settings.tickVolume;
        this.tickSound = tick1;

        const tick2 = createAudioPlayer(require('../../assets/audio/effects/tok1.mp3'), {
          keepAudioSessionActive: true,
        });
        tick2.volume = this.settings.tickVolume;
        this.alternateTickSound = tick2;
      } else if (this.settings.tickSound === 'classic') {
        // Classic mode: use tick.m4a
        const tick = createAudioPlayer(require('../../assets/audio/effects/tick.m4a'), {
          keepAudioSessionActive: true,
        });
        tick.volume = this.settings.tickVolume;
        this.tickSound = tick;
      } else if (this.settings.tickSound === 'beep') {
        // Beep mode: use beep.wav
        const tick = createAudioPlayer(require('../../assets/audio/effects/beep.wav'), {
          keepAudioSessionActive: true,
        });
        tick.volume = this.settings.tickVolume;
        this.tickSound = tick;
      }

      // Load ding sound for session completion
      const ding = createAudioPlayer(require('../../assets/audio/effects/ding.mp3'), {
        keepAudioSessionActive: true,
      });
      ding.volume = this.settings.announcementVolume;
      this.dingSound = ding;
    } catch (error) {
      console.error('Failed to load tick sounds:', error);
    }
  }

  async loadTransitionSounds() {
    try {
      const transitions = [
        { key: 'focus', file: require('../../assets/audio/countdown/transitions/focus.mp3') },
        { key: 'break', file: require('../../assets/audio/countdown/transitions/break.mp3') },
        { key: 'done', file: require('../../assets/audio/countdown/transitions/done.mp3') },
      ];

      for (const { key, file } of transitions) {
        const sound = createAudioPlayer(file, {
          keepAudioSessionActive: true,
        });
        sound.volume = this.settings.announcementVolume;
        this.transitionSounds.set(key, sound);
      }
    } catch (error) {
      console.error('Failed to load transition sounds:', error);
    }
  }

  async loadMinuteAnnouncement(minute: number) {
    if (minute < 1 || minute > 24) return;
    if (this.minuteAnnouncements.has(minute)) return;

    try {
      const sound = createAudioPlayer(this.getMinuteAnnouncementPath(minute), {
        keepAudioSessionActive: true,
      });
      sound.volume = this.settings.announcementVolume;
      this.minuteAnnouncements.set(minute, sound);
    } catch (error) {
      console.error(`Failed to load minute announcement for ${minute}:`, error);
    }
  }

  async loadSecondAnnouncement(second: number) {
    const validSeconds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50];
    if (!validSeconds.includes(second)) return;
    if (this.secondAnnouncements.has(second)) return;

    try {
      const sound = createAudioPlayer(this.getSecondAnnouncementPath(second), {
        keepAudioSessionActive: true,
      });
      sound.volume = this.settings.announcementVolume;
      this.secondAnnouncements.set(second, sound);
    } catch (error) {
      console.error(`Failed to load second announcement for ${second}:`, error);
    }
  }

  private getMinuteAnnouncementPath(minute: number) {
    const minuteStr = minute.toString().padStart(2, '0');
    // Map minute numbers to their require paths
    const paths: { [key: string]: any } = {
      '01': require('../../assets/audio/countdown/minutes/m01.mp3'),
      '02': require('../../assets/audio/countdown/minutes/m02.mp3'),
      '03': require('../../assets/audio/countdown/minutes/m03.mp3'),
      '04': require('../../assets/audio/countdown/minutes/m04.mp3'),
      '05': require('../../assets/audio/countdown/minutes/m05.mp3'),
      '06': require('../../assets/audio/countdown/minutes/m06.mp3'),
      '07': require('../../assets/audio/countdown/minutes/m07.mp3'),
      '08': require('../../assets/audio/countdown/minutes/m08.mp3'),
      '09': require('../../assets/audio/countdown/minutes/m09.mp3'),
      '10': require('../../assets/audio/countdown/minutes/m10.mp3'),
      '11': require('../../assets/audio/countdown/minutes/m11.mp3'),
      '12': require('../../assets/audio/countdown/minutes/m12.mp3'),
      '13': require('../../assets/audio/countdown/minutes/m13.mp3'),
      '14': require('../../assets/audio/countdown/minutes/m14.mp3'),
      '15': require('../../assets/audio/countdown/minutes/m15.mp3'),
      '16': require('../../assets/audio/countdown/minutes/m16.mp3'),
      '17': require('../../assets/audio/countdown/minutes/m17.mp3'),
      '18': require('../../assets/audio/countdown/minutes/m18.mp3'),
      '19': require('../../assets/audio/countdown/minutes/m19.mp3'),
      '20': require('../../assets/audio/countdown/minutes/m20.mp3'),
      '21': require('../../assets/audio/countdown/minutes/m21.mp3'),
      '22': require('../../assets/audio/countdown/minutes/m22.mp3'),
      '23': require('../../assets/audio/countdown/minutes/m23.mp3'),
      '24': require('../../assets/audio/countdown/minutes/m24.mp3'),
    };
    return paths[minuteStr];
  }

  private getSecondAnnouncementPath(second: number) {
    const secondStr = second.toString().padStart(2, '0');
    // Map second numbers to their require paths
    const paths: { [key: string]: any } = {
      '01': require('../../assets/audio/countdown/seconds/s01.mp3'),
      '02': require('../../assets/audio/countdown/seconds/s02.mp3'),
      '03': require('../../assets/audio/countdown/seconds/s03.mp3'),
      '04': require('../../assets/audio/countdown/seconds/s04.mp3'),
      '05': require('../../assets/audio/countdown/seconds/s05.mp3'),
      '06': require('../../assets/audio/countdown/seconds/s06.mp3'),
      '07': require('../../assets/audio/countdown/seconds/s07.mp3'),
      '08': require('../../assets/audio/countdown/seconds/s08.mp3'),
      '09': require('../../assets/audio/countdown/seconds/s09.mp3'),
      '10': require('../../assets/audio/countdown/seconds/s10.mp3'),
      '20': require('../../assets/audio/countdown/seconds/s20.mp3'),
      '30': require('../../assets/audio/countdown/seconds/s30.mp3'),
      '40': require('../../assets/audio/countdown/seconds/s40.mp3'),
      '50': require('../../assets/audio/countdown/seconds/s50.mp3'),
    };
    return paths[secondStr];
  }

  async playTick(sessionType?: SessionType) {
    if (this.settings.muteAll) return;
    if (this.settings.muteDuringBreaks && sessionType === 'break') return;

    try {
      // NOTE: Do NOT call setAudioModeAsync here. Switching audio modes on every
      // tick (fire-and-forget, 1Hz) causes concurrent iOS AVAudioSession calls that
      // corrupt the session after many sessions, silently dropping all ticks.
      // The session is already configured correctly by initialize().

      // Handle alternating sounds
      // Reuses the same player instances - no new allocations per tick
      if (this.settings.tickSound === 'alternating' && this.alternateTickSound && this.tickSound) {
        const soundToPlay = this.isAlternate ? this.alternateTickSound : this.tickSound;
        this.isAlternate = !this.isAlternate;

        await soundToPlay.seekTo(0);
        soundToPlay.play();
      } else if (this.tickSound) {
        // Handle single sounds (single, classic, beep)
        await this.tickSound.seekTo(0);
        this.tickSound.play();
      }
    } catch (error) {
      console.error('Failed to play tick:', error);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TICK LOOP - Independent 1s interval owned by audioService
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Start the tick loop. Guarantees:
   * - Only one interval runs at a time (calls stopTickLoop first)
   * - Uses Date.now via callbacks for drift-free timing
   * - Reuses existing player instances (no allocations per tick)
   */
  startTickLoop(callbacks: TickLoopCallbacks): void {
    // Cleanup any existing loop first - guarantees no duplicate intervals
    this.stopTickLoop();

    this.tickLoopCallbacks = callbacks;
    this.lastTickedSecond = -1;
    this.lastAnnouncedMinute = -1;
    this.lastAnnouncedSecond = -1;

    // Execute immediately for the first tick, then every 1000ms
    this.executeTickLoopCycle();
    this.tickLoopInterval = setInterval(() => {
      this.executeTickLoopCycle();
    }, 1000);
  }

  /**
   * Stop the tick loop and reset all tracking state.
   * Safe to call multiple times.
   */
  stopTickLoop(): void {
    if (this.tickLoopInterval !== null) {
      clearInterval(this.tickLoopInterval);
      this.tickLoopInterval = null;
    }
    this.tickLoopCallbacks = null;
    this.lastTickedSecond = -1;
    this.lastAnnouncedMinute = -1;
    this.lastAnnouncedSecond = -1;
    this.transitionWarningTriggered60 = false;
    this.transitionWarningTriggered30 = false;
  }

  /**
   * Reset announcement tracking without stopping the loop.
   * Call this when the timer resets or skips to a new session.
   */
  resetAnnouncementTracking(): void {
    this.lastAnnouncedMinute = -1;
    this.lastAnnouncedSecond = -1;
    this.transitionWarningTriggered60 = false;
    this.transitionWarningTriggered30 = false;
  }

  /**
   * Single tick cycle - called every 1s by the interval.
   * All timing derived from Date.now via callbacks (no drift).
   */
  private executeTickLoopCycle(): void {
    if (!this.tickLoopCallbacks) return;

    const timeRemaining = this.tickLoopCallbacks.getTimeRemaining();
    const totalTime = this.tickLoopCallbacks.getTotalTime();
    const sessionType = this.tickLoopCallbacks.getSessionType();

    // Guard: skip if timer has ended
    if (timeRemaining <= 0) return;

    const currentSecond = Math.floor(timeRemaining);
    const currentMinute = Math.ceil(timeRemaining / 60);

    // ─── TICK SOUND ───
    // Only play once per second (guard against interval drift calling twice)
    if (currentSecond !== this.lastTickedSecond) {
      this.lastTickedSecond = currentSecond;

      if (sessionType) {
        this.playTick(sessionType);
      }
    }

    // ─── MINUTE BOUNDARY DETECTION ───
    // Detect minute boundary crossing: when currentMinute differs from lastAnnouncedMinute
    // This handles both normal countdown and any lag/skip scenarios
    if (currentMinute !== this.lastAnnouncedMinute && currentMinute > 0) {
      const previousMinute = this.lastAnnouncedMinute;
      this.lastAnnouncedMinute = currentMinute;

      // Haptic feedback on minute change (via explicit callback, not effect)
      this.tickLoopCallbacks.onHapticLight();

      // Voice announcements only in Awareness Mode (≤25 min sessions)
      const sessionDurationMinutes = totalTime / 60;
      const isAwarenessMode = sessionDurationMinutes <= 25;

      if (isAwarenessMode && previousMinute !== -1) {
        // Announce at configured interval (e.g., every 5 minutes)
        if (currentMinute % this.settings.announcementInterval === 0) {
          this.announceTimeRemaining(currentMinute);
        }
      }
    }

    // ─── SECONDS COUNTDOWN (Final minute) ───
    if (currentSecond < 60 && currentSecond > 0) {
      const secondsToAnnounce = [50, 40, 30, 20, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

      if (secondsToAnnounce.includes(currentSecond) && currentSecond !== this.lastAnnouncedSecond) {
        this.lastAnnouncedSecond = currentSecond;

        const sessionDurationMinutes = totalTime / 60;
        const isAwarenessMode = sessionDurationMinutes <= 25;

        if (isAwarenessMode && this.settings.secondsCountdown) {
          this.announceSecondsRemaining(currentSecond);
        }
      }
    }

    // ─── TRANSITION WARNING (60s and 30s before end) ───
    // Only for sessions >= 2 minutes (to avoid overlap with very short sessions)
    if (this.settings.transitionWarningEnabled && totalTime >= 120) {
      // Trigger at 60 seconds
      if (currentSecond <= 60 && currentSecond > 30 && !this.transitionWarningTriggered60) {
        this.transitionWarningTriggered60 = true;
        // Double-tap haptic for transition warning
        if (this.tickLoopCallbacks?.onTransitionHaptic) {
          this.tickLoopCallbacks.onTransitionHaptic();
        }
      }

      // Trigger at 30 seconds
      if (currentSecond <= 30 && currentSecond > 0 && !this.transitionWarningTriggered30) {
        this.transitionWarningTriggered30 = true;
        // Double-tap haptic for transition warning
        if (this.tickLoopCallbacks?.onTransitionHaptic) {
          this.tickLoopCallbacks.onTransitionHaptic();
        }
        // Play transition chime if enabled (for users without seconds countdown)
        if (this.settings.transitionChimeEnabled && !this.settings.secondsCountdown) {
          this.playTransitionChime();
        }
      }
    }
  }

  async announceTimeRemaining(minutes: number) {
    if (this.settings.muteAll) return;

    // Load the announcement if not already loaded
    await this.loadMinuteAnnouncement(minutes);

    const announcement = this.minuteAnnouncements.get(minutes);
    if (announcement) {
      try {
        // Use duckOthers for voice announcements - briefly lower music volume
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await announcement.seekTo(0);
        announcement.play();
      } catch (error) {
        console.error(`Failed to play minute announcement for ${minutes}:`, error);
      }
    }
  }

  async announceSecondsRemaining(seconds: number) {
    if (this.settings.muteAll) return;

    // Load the announcement if not already loaded
    await this.loadSecondAnnouncement(seconds);

    const announcement = this.secondAnnouncements.get(seconds);
    if (announcement) {
      try {
        // Use duckOthers for voice announcements - briefly lower music volume
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await announcement.seekTo(0);
        announcement.play();
      } catch (error) {
        console.error(`Failed to play second announcement for ${seconds}:`, error);
      }
    }
  }

  async announceSessionStart(sessionType: SessionType) {
    if (this.settings.muteAll) return;

    const soundKey = sessionType === 'focus' || sessionType === 'settle' ? 'focus' : 'break';
    const sound = this.transitionSounds.get(soundKey);

    if (sound) {
      try {
        // Use duckOthers for transition announcements
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await sound.seekTo(0);
        sound.play();
      } catch (error) {
        console.error('Failed to play session start sound:', error);
      }
    }
  }

  async announceSessionComplete() {
    if (this.settings.muteAll) return;

    if (this.dingSound) {
      try {
        // Use duckOthers for completion sounds
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await this.dingSound.seekTo(0);
        this.dingSound.play();
      } catch (error) {
        console.error('Failed to play ding sound:', error);
      }
    }
  }

  async announceAllComplete() {
    if (this.settings.muteAll) return;

    const sound = this.transitionSounds.get('done');
    if (sound) {
      try {
        // Use duckOthers for completion sounds
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await sound.seekTo(0);
        sound.play();
      } catch (error) {
        console.error('Failed to play completion sound:', error);
      }
    }
  }

  /**
   * Load the transition chime sound (gentle notification for wrapping up)
   */
  async loadTransitionChime() {
    if (this.transitionChimeSound) return; // Already loaded

    try {
      // Reuse the ding sound for transition chime (gentle, non-intrusive)
      this.transitionChimeSound = createAudioPlayer(require('../../assets/audio/effects/ding.mp3'), {
        keepAudioSessionActive: true,
      });
      this.transitionChimeSound.volume = this.settings.announcementVolume * 0.7; // Slightly softer
    } catch (error) {
      console.error('Failed to load transition chime:', error);
    }
  }

  /**
   * Play a gentle chime to signal transition is approaching
   * Used for users who have seconds countdown disabled
   */
  async playTransitionChime() {
    if (this.settings.muteAll) return;

    // Load on demand if not already loaded
    if (!this.transitionChimeSound) {
      await this.loadTransitionChime();
    }

    if (this.transitionChimeSound) {
      try {
        await setAudioModeWithInterruption({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'duckOthers',
        });
        await this.transitionChimeSound.seekTo(0);
        this.transitionChimeSound.play();
      } catch (error) {
        console.error('Failed to play transition chime:', error);
      }
    }
  }

  async updateSettings(newSettings: Partial<AudioSettings>) {
    const oldTickSound = this.settings.tickSound;
    this.settings = { ...this.settings, ...newSettings };

    // Persist settings to storage (load current profile to preserve it)
    try {
      const currentStorage = await loadAudioSettings();
      await saveAudioSettings({
        ...currentStorage,
        tickVolume: this.settings.tickVolume,
        announcementVolume: this.settings.announcementVolume,
        tickSound: this.settings.tickSound,
        muteAll: this.settings.muteAll,
        muteDuringBreaks: this.settings.muteDuringBreaks,
        announcementInterval: this.settings.announcementInterval,
        secondsCountdown: this.settings.secondsCountdown,
      });
    } catch (error) {
      console.error('Failed to save audio settings:', error);
    }

    // If tick sound type changed, reload the tick sounds
    if (newSettings.tickSound && newSettings.tickSound !== oldTickSound) {
      // Clean up old tick sounds
      if (this.tickSound) {
        this.tickSound.remove();
        this.tickSound = null;
      }
      if (this.alternateTickSound) {
        this.alternateTickSound.remove();
        this.alternateTickSound = null;
      }

      // Reload with new tick sound type
      await this.loadTickSounds();
    } else {
      // Just update volume of existing sounds
      if (this.tickSound) {
        this.tickSound.volume = this.settings.tickVolume;
      }
      if (this.alternateTickSound) {
        this.alternateTickSound.volume = this.settings.tickVolume;
      }
    }

    if (this.dingSound) {
      this.dingSound.volume = this.settings.announcementVolume;
    }

    // Update volumes for all loaded announcements
    this.minuteAnnouncements.forEach((sound) => {
      sound.volume = this.settings.announcementVolume;
    });

    this.secondAnnouncements.forEach((sound) => {
      sound.volume = this.settings.announcementVolume;
    });

    this.transitionSounds.forEach((sound) => {
      sound.volume = this.settings.announcementVolume;
    });
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    // Stop tick loop first - guarantees no callbacks fire after cleanup
    this.stopTickLoop();

    // Remove app state listener
    if (this.appStateSubscription) {
      this.appStateSubscription.remove();
      this.appStateSubscription = null;
    }

    if (this.tickSound) {
      this.tickSound.remove();
      this.tickSound = null;
    }
    if (this.alternateTickSound) {
      this.alternateTickSound.remove();
      this.alternateTickSound = null;
    }
    if (this.dingSound) {
      this.dingSound.remove();
      this.dingSound = null;
    }
    if (this.transitionChimeSound) {
      this.transitionChimeSound.remove();
      this.transitionChimeSound = null;
    }

    // Cleanup all minute announcements
    for (const sound of this.minuteAnnouncements.values()) {
      sound.remove();
    }
    this.minuteAnnouncements.clear();

    // Cleanup all second announcements
    for (const sound of this.secondAnnouncements.values()) {
      sound.remove();
    }
    this.secondAnnouncements.clear();

    // Cleanup transition sounds
    for (const sound of this.transitionSounds.values()) {
      sound.remove();
    }
    this.transitionSounds.clear();
  }
}

// Export singleton instance
export const audioService = new AudioService();

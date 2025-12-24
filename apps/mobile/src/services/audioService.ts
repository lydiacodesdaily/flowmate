import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import type { AudioPlayer } from 'expo-audio';
import type { AudioSettings, SessionType } from '@flowmate/shared';
import { AppState } from 'react-native';
import type { AppStateStatus } from 'react-native';

class AudioService {
  private tickSound: AudioPlayer | null = null;
  private alternateTickSound: AudioPlayer | null = null;
  private beepSound: AudioPlayer | null = null;
  private dingSound: AudioPlayer | null = null;
  private transitionSounds: Map<string, AudioPlayer> = new Map();
  private minuteAnnouncements: Map<number, AudioPlayer> = new Map();
  private secondAnnouncements: Map<number, AudioPlayer> = new Map();
  private isAlternate = false;
  private appStateSubscription: any = null;
  private settings: AudioSettings = {
    tickVolume: 0.5,
    announcementVolume: 0.7,
    tickSound: 'single',
    muteAll: false,
    muteDuringBreaks: false,
    announcementInterval: 1,
  };

  async initialize() {
    try {
      // Set audio mode for background playback and mixing with other apps
      await setAudioModeAsync({
        playsInSilentMode: true,
        // Allow audio to continue playing in background
        shouldPlayInBackground: true,
        // Mix with other apps (like music players) - announcements will briefly lower their volume
        interruptionMode: 'duckOthers',
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
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });
      console.log(`Audio session reactivated (state: ${nextAppState})`);
    } catch (error) {
      console.error('Failed to reactivate audio session:', error);
    }
  };

  async loadTickSounds() {
    try {
      // Load sounds based on tick sound setting
      if (this.settings.tickSound === 'single') {
        // Single mode: use tick.m4a
        const tick = createAudioPlayer(require('../../assets/audio/effects/tick.m4a'), {
          keepAudioSessionActive: true,
        });
        tick.volume = this.settings.tickVolume;
        this.tickSound = tick;
      } else if (this.settings.tickSound === 'alternating') {
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
      } else if (this.settings.tickSound === 'beep') {
        // Beep mode: use beep2.mp3
        const beep = createAudioPlayer(require('../../assets/audio/effects/beep2.mp3'), {
          keepAudioSessionActive: true,
        });
        beep.volume = this.settings.tickVolume;
        this.beepSound = beep;
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
      if (this.settings.tickSound === 'alternating' && this.alternateTickSound && this.tickSound) {
        const soundToPlay = this.isAlternate ? this.alternateTickSound : this.tickSound;
        this.isAlternate = !this.isAlternate;

        await soundToPlay.seekTo(0);
        soundToPlay.play();
      } else if (this.settings.tickSound === 'beep' && this.beepSound) {
        await this.beepSound.seekTo(0);
        this.beepSound.play();
      } else if (this.settings.tickSound === 'single' && this.tickSound) {
        await this.tickSound.seekTo(0);
        this.tickSound.play();
      }
    } catch (error) {
      console.error('Failed to play tick:', error);
    }
  }

  async announceTimeRemaining(minutes: number) {
    if (this.settings.muteAll) return;

    // Load the announcement if not already loaded
    await this.loadMinuteAnnouncement(minutes);

    const announcement = this.minuteAnnouncements.get(minutes);
    if (announcement) {
      try {
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
        await sound.seekTo(0);
        sound.play();
      } catch (error) {
        console.error('Failed to play completion sound:', error);
      }
    }
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    const oldTickSound = this.settings.tickSound;
    this.settings = { ...this.settings, ...newSettings };

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
      if (this.beepSound) {
        this.beepSound.remove();
        this.beepSound = null;
      }

      // Reload with new tick sound type
      this.loadTickSounds();
    } else {
      // Just update volume of existing sounds
      if (this.tickSound) {
        this.tickSound.volume = this.settings.tickVolume;
      }
      if (this.alternateTickSound) {
        this.alternateTickSound.volume = this.settings.tickVolume;
      }
      if (this.beepSound) {
        this.beepSound.volume = this.settings.tickVolume;
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
    if (this.beepSound) {
      this.beepSound.remove();
      this.beepSound = null;
    }
    if (this.dingSound) {
      this.dingSound.remove();
      this.dingSound = null;
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

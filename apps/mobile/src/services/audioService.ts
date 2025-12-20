import { Audio } from 'expo-av';
import type { AudioSettings, SessionType } from '@flowmate/shared';

class AudioService {
  private tickSound: Audio.Sound | null = null;
  private alternateTickSound: Audio.Sound | null = null;
  private dingSound: Audio.Sound | null = null;
  private transitionSounds: Map<string, Audio.Sound> = new Map();
  private minuteAnnouncements: Map<number, Audio.Sound> = new Map();
  private isAlternate = false;
  private settings: AudioSettings = {
    tickVolume: 0.5,
    announcementVolume: 0.7,
    tickSound: 'single',
    muteAll: false,
    muteDuringBreaks: false,
    announcementInterval: 5,
  };

  async initialize() {
    try {
      // Set audio mode for mixing with other apps
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  async loadTickSounds() {
    try {
      // Load primary tick sound
      const { sound: tick1 } = await Audio.Sound.createAsync(
        require('../../assets/audio/effects/tick1.mp3'),
        { volume: this.settings.tickVolume }
      );
      this.tickSound = tick1;

      // Load alternate tick sound for alternating mode
      if (this.settings.tickSound === 'alternating') {
        const { sound: tick2 } = await Audio.Sound.createAsync(
          require('../../assets/audio/effects/tok1.mp3'),
          { volume: this.settings.tickVolume }
        );
        this.alternateTickSound = tick2;
      }

      // Load ding sound for session completion
      const { sound: ding } = await Audio.Sound.createAsync(
        require('../../assets/audio/effects/ding.mp3'),
        { volume: this.settings.announcementVolume }
      );
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
        const { sound } = await Audio.Sound.createAsync(file, {
          volume: this.settings.announcementVolume,
        });
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
      const minuteStr = minute.toString().padStart(2, '0');
      const { sound } = await Audio.Sound.createAsync(
        // Dynamically require based on minute number
        this.getMinuteAnnouncementPath(minute),
        { volume: this.settings.announcementVolume }
      );
      this.minuteAnnouncements.set(minute, sound);
    } catch (error) {
      console.error(`Failed to load minute announcement for ${minute}:`, error);
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

  async playTick(sessionType?: SessionType) {
    if (this.settings.muteAll) return;
    if (this.settings.muteDuringBreaks && sessionType === 'break') return;

    try {
      if (this.settings.tickSound === 'alternating' && this.alternateTickSound) {
        const soundToPlay = this.isAlternate ? this.alternateTickSound : this.tickSound;
        this.isAlternate = !this.isAlternate;

        if (soundToPlay) {
          await soundToPlay.replayAsync();
        }
      } else if (this.tickSound) {
        await this.tickSound.replayAsync();
      }
    } catch (error) {
      console.error('Failed to play tick:', error);
    }
  }

  async announceTimeRemaining(minutes: number, sessionType: SessionType) {
    if (this.settings.muteAll) return;

    // Load the announcement if not already loaded
    await this.loadMinuteAnnouncement(minutes);

    const announcement = this.minuteAnnouncements.get(minutes);
    if (announcement) {
      try {
        await announcement.replayAsync();
      } catch (error) {
        console.error(`Failed to play minute announcement for ${minutes}:`, error);
      }
    }
  }

  async announceSessionStart(sessionType: SessionType, durationMinutes: number) {
    if (this.settings.muteAll) return;

    const soundKey = sessionType === 'focus' || sessionType === 'settle' ? 'focus' : 'break';
    const sound = this.transitionSounds.get(soundKey);

    if (sound) {
      try {
        await sound.replayAsync();
      } catch (error) {
        console.error('Failed to play session start sound:', error);
      }
    }
  }

  async announceSessionComplete(sessionType: SessionType) {
    if (this.settings.muteAll) return;

    if (this.dingSound) {
      try {
        await this.dingSound.replayAsync();
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
        await sound.replayAsync();
      } catch (error) {
        console.error('Failed to play completion sound:', error);
      }
    }
  }

  updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    // Update volume of existing sounds
    if (this.tickSound) {
      this.tickSound.setVolumeAsync(this.settings.tickVolume);
    }
    if (this.alternateTickSound) {
      this.alternateTickSound.setVolumeAsync(this.settings.tickVolume);
    }
    if (this.dingSound) {
      this.dingSound.setVolumeAsync(this.settings.announcementVolume);
    }

    // Update volumes for all loaded announcements
    this.minuteAnnouncements.forEach((sound) => {
      sound.setVolumeAsync(this.settings.announcementVolume);
    });

    this.transitionSounds.forEach((sound) => {
      sound.setVolumeAsync(this.settings.announcementVolume);
    });
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  async cleanup() {
    if (this.tickSound) {
      await this.tickSound.unloadAsync();
      this.tickSound = null;
    }
    if (this.alternateTickSound) {
      await this.alternateTickSound.unloadAsync();
      this.alternateTickSound = null;
    }
    if (this.dingSound) {
      await this.dingSound.unloadAsync();
      this.dingSound = null;
    }

    // Cleanup all minute announcements
    for (const sound of this.minuteAnnouncements.values()) {
      await sound.unloadAsync();
    }
    this.minuteAnnouncements.clear();

    // Cleanup transition sounds
    for (const sound of this.transitionSounds.values()) {
      await sound.unloadAsync();
    }
    this.transitionSounds.clear();
  }
}

// Export singleton instance
export const audioService = new AudioService();

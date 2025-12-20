import { Audio, AVPlaybackStatus } from 'expo-av';
import type { AudioSettings, SessionType } from '@flowmate/shared';

class AudioService {
  private tickSound: Audio.Sound | null = null;
  private alternateTickSound: Audio.Sound | null = null;
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
        require('../../assets/sounds/tick.mp3'),
        { volume: this.settings.tickVolume }
      );
      this.tickSound = tick1;

      // Load alternate tick sound for alternating mode
      if (this.settings.tickSound === 'alternating') {
        const { sound: tick2 } = await Audio.Sound.createAsync(
          require('../../assets/sounds/tick-alt.mp3'),
          { volume: this.settings.tickVolume }
        );
        this.alternateTickSound = tick2;
      }
    } catch (error) {
      console.error('Failed to load tick sounds:', error);
    }
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

  async playAnnouncement(text: string) {
    if (this.settings.muteAll) return;

    // In a production app, you would use text-to-speech or pre-recorded announcements
    // For now, we'll just log the announcement
    console.log('Announcement:', text);

    // TODO: Implement TTS or play pre-recorded announcement sounds
    // Example with expo-speech:
    // import * as Speech from 'expo-speech';
    // Speech.speak(text, { volume: this.settings.announcementVolume });
  }

  async announceTimeRemaining(minutes: number, sessionType: SessionType) {
    const sessionName = sessionType === 'focus' ? 'focus time' : sessionType;
    const text = `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} of ${sessionName} remaining`;
    await this.playAnnouncement(text);
  }

  async announceSessionStart(sessionType: SessionType, durationMinutes: number) {
    const sessionName = sessionType === 'focus' ? 'focus session' : `${sessionType} session`;
    const text = `Starting ${durationMinutes} minute ${sessionName}`;
    await this.playAnnouncement(text);
  }

  async announceSessionComplete(sessionType: SessionType) {
    const sessionName = sessionType === 'focus' ? 'focus session' : `${sessionType} session`;
    const text = `${sessionName} complete`;
    await this.playAnnouncement(text);
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
  }
}

// Export singleton instance
export const audioService = new AudioService();

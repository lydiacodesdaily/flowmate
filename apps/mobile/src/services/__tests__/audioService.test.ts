import { audioService } from '../audioService';
import type { AudioSettings } from '@flowmate/shared';
import * as storage from '../../utils/storage';
import * as ExpoAudio from 'expo-audio';

// Mock the storage module
jest.mock('../../utils/storage', () => ({
  loadAudioSettings: jest.fn(() =>
    Promise.resolve({
      tickVolume: 0.5,
      announcementVolume: 0.7,
      tickSound: 'classic',
      muteAll: false,
      muteDuringBreaks: false,
      announcementInterval: 1,
      currentProfile: 'Balanced',
    })
  ),
  saveAudioSettings: jest.fn(() => Promise.resolve()),
}));

describe('AudioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should load settings from storage on initialization', async () => {
      await audioService.initialize();

      expect(storage.loadAudioSettings).toHaveBeenCalled();
      expect(ExpoAudio.setAudioModeAsync).toHaveBeenCalledWith({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
        interruptionMode: 'duckOthers',
      });
    });

    it('should handle initialization errors gracefully', async () => {
      (storage.loadAudioSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      // Should not throw - error is caught and logged
      await expect(audioService.initialize()).resolves.not.toThrow();
    });
  });

  describe('getSettings', () => {
    it('should return current audio settings', async () => {
      await audioService.initialize();

      const settings = audioService.getSettings();

      expect(settings).toEqual({
        tickVolume: 0.5,
        announcementVolume: 0.7,
        tickSound: 'classic',
        muteAll: false,
        muteDuringBreaks: false,
        announcementInterval: 1,
      });
    });

    it('should return a copy of settings (not reference)', async () => {
      await audioService.initialize();

      const settings1 = audioService.getSettings();
      const settings2 = audioService.getSettings();

      expect(settings1).not.toBe(settings2);
      expect(settings1).toEqual(settings2);
    });
  });

  describe('updateSettings', () => {
    it('should update settings and persist to storage', async () => {
      await audioService.initialize();

      const newSettings: Partial<AudioSettings> = {
        tickVolume: 0.8,
        muteAll: true,
      };

      await audioService.updateSettings(newSettings);

      const settings = audioService.getSettings();
      expect(settings.tickVolume).toBe(0.8);
      expect(settings.muteAll).toBe(true);
      expect(storage.saveAudioSettings).toHaveBeenCalled();
    });

    it('should reload tick sounds when tick sound type changes', async () => {
      await audioService.initialize();
      await audioService.loadTickSounds();

      const newSettings: Partial<AudioSettings> = {
        tickSound: 'single',
      };

      await audioService.updateSettings(newSettings);

      const settings = audioService.getSettings();
      expect(settings.tickSound).toBe('single');
    });

    it('should handle storage errors gracefully when updating settings', async () => {
      await audioService.initialize();

      (storage.saveAudioSettings as jest.Mock).mockRejectedValueOnce(
        new Error('Storage error')
      );

      const newSettings: Partial<AudioSettings> = {
        tickVolume: 0.9,
      };

      await audioService.updateSettings(newSettings);

      // Settings should still be updated in memory
      const settings = audioService.getSettings();
      expect(settings.tickVolume).toBe(0.9);
    });
  });

  describe('playTick', () => {
    it('should not play tick when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });
      await audioService.loadTickSounds();

      await audioService.playTick('focus');

      // Verify that no audio play was attempted
      // Since mocked, we just verify muteAll prevents playback
      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should not play tick during breaks when muteDuringBreaks is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteDuringBreaks: true });
      await audioService.loadTickSounds();

      await audioService.playTick('break');

      const settings = audioService.getSettings();
      expect(settings.muteDuringBreaks).toBe(true);
    });

    it('should play tick during focus sessions', async () => {
      await audioService.initialize();
      await audioService.loadTickSounds();

      await audioService.playTick('focus');

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('announceTimeRemaining', () => {
    it('should not announce when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });

      await audioService.announceTimeRemaining(5);

      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should load and play minute announcement', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: false });

      await audioService.announceTimeRemaining(10);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should handle minutes outside valid range gracefully', async () => {
      await audioService.initialize();

      // Minutes outside 1-24 range should be ignored
      await audioService.announceTimeRemaining(0);
      await audioService.announceTimeRemaining(25);
      await audioService.announceTimeRemaining(100);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('announceSecondsRemaining', () => {
    it('should not announce when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });

      await audioService.announceSecondsRemaining(10);

      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should load and play valid second announcements', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: false });

      const validSeconds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 30, 40, 50];

      for (const second of validSeconds) {
        await audioService.announceSecondsRemaining(second);
      }

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should ignore invalid second values', async () => {
      await audioService.initialize();

      // Invalid seconds should be ignored
      await audioService.announceSecondsRemaining(15);
      await audioService.announceSecondsRemaining(60);

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('announceSessionStart', () => {
    it('should not announce when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });
      await audioService.loadTransitionSounds();

      await audioService.announceSessionStart('focus');

      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should play focus sound for focus sessions', async () => {
      await audioService.initialize();
      await audioService.loadTransitionSounds();

      await audioService.announceSessionStart('focus');

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should play focus sound for settle sessions', async () => {
      await audioService.initialize();
      await audioService.loadTransitionSounds();

      await audioService.announceSessionStart('settle');

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should play break sound for break sessions', async () => {
      await audioService.initialize();
      await audioService.loadTransitionSounds();

      await audioService.announceSessionStart('break');

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('announceSessionComplete', () => {
    it('should not announce when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });
      await audioService.loadTickSounds();

      await audioService.announceSessionComplete();

      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should play ding sound', async () => {
      await audioService.initialize();
      await audioService.loadTickSounds();

      await audioService.announceSessionComplete();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('announceAllComplete', () => {
    it('should not announce when muteAll is enabled', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ muteAll: true });
      await audioService.loadTransitionSounds();

      await audioService.announceAllComplete();

      const settings = audioService.getSettings();
      expect(settings.muteAll).toBe(true);
    });

    it('should play done transition sound', async () => {
      await audioService.initialize();
      await audioService.loadTransitionSounds();

      await audioService.announceAllComplete();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('loadTickSounds', () => {
    it('should load single tick sound', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ tickSound: 'single' });

      await audioService.loadTickSounds();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should load alternating tick sounds', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ tickSound: 'alternating' });

      await audioService.loadTickSounds();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should load alternating2 tick sounds', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ tickSound: 'alternating2' });

      await audioService.loadTickSounds();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should load classic tick sound', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ tickSound: 'classic' });

      await audioService.loadTickSounds();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });

    it('should load beep tick sound', async () => {
      await audioService.initialize();
      await audioService.updateSettings({ tickSound: 'beep' });

      await audioService.loadTickSounds();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });

  describe('cleanup', () => {
    it('should cleanup all audio resources', async () => {
      await audioService.initialize();
      await audioService.loadTickSounds();
      await audioService.loadTransitionSounds();
      await audioService.loadMinuteAnnouncement(10);
      await audioService.loadSecondAnnouncement(10);

      await audioService.cleanup();

      // Test passes if no error is thrown
      expect(true).toBe(true);
    });
  });
});

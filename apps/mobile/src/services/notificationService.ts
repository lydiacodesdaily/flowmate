import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SessionType } from '@flowmate/shared';
import {
  loadNotificationSettings,
  saveNotificationSettings,
  getDefaultNotificationSettings,
  type NotificationSettings
} from '../utils/storage';

class NotificationService {
  private permissionGranted = false;
  private settings: NotificationSettings = getDefaultNotificationSettings();

  async initialize() {
    // Load saved settings
    this.settings = await loadNotificationSettings();

    // Configure notification handler with dynamic sound setting
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: this.settings.sound,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('timer', {
        name: 'Timer Notifications',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#E94B3C',
      });
    }

    await this.requestPermissions();
  }

  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    this.permissionGranted = finalStatus === 'granted';
    return this.permissionGranted;
  }

  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  async updateSettings(newSettings: Partial<NotificationSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    await saveNotificationSettings(this.settings);

    // Update notification handler if sound setting changed
    if (newSettings.sound !== undefined) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldPlaySound: this.settings.sound,
          shouldSetBadge: false,
          shouldShowBanner: true,
          shouldShowList: true,
        }),
      });
    }
  }

  async scheduleSessionCompleteNotification(sessionType: SessionType) {
    if (!this.permissionGranted || !this.settings.enabled || !this.settings.sessionComplete) {
      return;
    }

    const sessionName = sessionType === 'focus' ? 'Focus session' : `${sessionType} session`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session Complete',
        body: `${sessionName} finished. Time for the next session!`,
        sound: this.settings.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  async scheduleSessionStartNotification(sessionType: SessionType, durationMinutes: number) {
    if (!this.permissionGranted || !this.settings.enabled || !this.settings.sessionStart) {
      return;
    }

    const sessionName = sessionType === 'focus' ? 'focus session' : `${sessionType} session`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session Started',
        body: `${durationMinutes} minute ${sessionName} has begun`,
        sound: this.settings.sound,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  async scheduleTimeRemainingNotification(minutes: number, sessionType: SessionType) {
    if (!this.permissionGranted || !this.settings.enabled || !this.settings.timeRemaining) {
      return;
    }

    const sessionName = sessionType === 'focus' ? 'focus time' : sessionType;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time Check',
        body: `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} of ${sessionName} remaining`,
        sound: false,
        priority: Notifications.AndroidNotificationPriority.DEFAULT,
      },
      trigger: null,
    });
  }

  async cancelAllNotifications() {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }
}

export const notificationService = new NotificationService();

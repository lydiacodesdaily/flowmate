import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { SessionType } from '@flowmate/shared';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  private permissionGranted = false;

  async initialize() {
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

  async scheduleSessionCompleteNotification(sessionType: SessionType) {
    if (!this.permissionGranted) {
      return;
    }

    const sessionName = sessionType === 'focus' ? 'Focus session' : `${sessionType} session`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session Complete',
        body: `${sessionName} finished. Time for the next session!`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Send immediately
    });
  }

  async scheduleSessionStartNotification(sessionType: SessionType, durationMinutes: number) {
    if (!this.permissionGranted) {
      return;
    }

    const sessionName = sessionType === 'focus' ? 'focus session' : `${sessionType} session`;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Session Started',
        body: `${durationMinutes} minute ${sessionName} has begun`,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null,
    });
  }

  async scheduleTimeRemainingNotification(minutes: number, sessionType: SessionType) {
    if (!this.permissionGranted) {
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

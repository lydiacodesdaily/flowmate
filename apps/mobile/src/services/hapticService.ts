import * as Haptics from 'expo-haptics';

class HapticService {
  async light() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async medium() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async heavy() {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async success() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async warning() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async error() {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async selection() {
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }
}

export const hapticService = new HapticService();

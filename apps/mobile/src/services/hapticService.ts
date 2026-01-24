import * as Haptics from 'expo-haptics';

class HapticService {
  private enabled: boolean = true;

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async light() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async medium() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async heavy() {
    if (!this.enabled) return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async success() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async warning() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async error() {
    if (!this.enabled) return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }

  async selection() {
    if (!this.enabled) return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      console.error('Haptic feedback error:', error);
    }
  }
}

export const hapticService = new HapticService();

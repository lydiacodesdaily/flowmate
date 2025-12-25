import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserStats, DailyStat, Session } from '@flowmate/shared';

const STATS_STORAGE_KEY = '@flowmate:stats';

const defaultStats: UserStats = {
  dailyStats: [],
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  totalSessions: 0,
};

class StatsService {
  private cache: UserStats | null = null;

  async getStats(): Promise<UserStats> {
    if (this.cache) {
      return this.cache;
    }

    try {
      const data = await AsyncStorage.getItem(STATS_STORAGE_KEY);
      if (data) {
        this.cache = JSON.parse(data);
        return this.cache!;
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }

    // Return a deep copy of defaultStats to avoid mutations
    return JSON.parse(JSON.stringify(defaultStats));
  }

  async saveStats(stats: UserStats): Promise<void> {
    try {
      this.cache = stats;
      await AsyncStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Failed to save stats:', error);
    }
  }

  async recordSession(session: Session): Promise<void> {
    const stats = await this.getStats();
    const today = this.getTodayDateString();

    // Update or create today's stat
    let todayStat = stats.dailyStats.find((s) => s.date === today);

    if (!todayStat) {
      todayStat = {
        date: today,
        focusTimeMinutes: 0,
        sessionsCompleted: 0,
      };
      stats.dailyStats.push(todayStat);
    }

    // Only count focus and settle sessions toward focus time
    if (session.type === 'focus' || session.type === 'settle') {
      todayStat.focusTimeMinutes += session.durationMinutes;
      stats.totalFocusTime += session.durationMinutes;
    }

    todayStat.sessionsCompleted += 1;
    stats.totalSessions += 1;

    // Update streaks
    this.updateStreaks(stats);

    await this.saveStats(stats);
  }

  private updateStreaks(stats: UserStats): void {
    if (stats.dailyStats.length === 0) {
      stats.currentStreak = 0;
      return;
    }

    // Sort by date descending
    const sorted = [...stats.dailyStats].sort((a, b) => b.date.localeCompare(a.date));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let expectedDate = this.getTodayDateString();

    for (const stat of sorted) {
      if (stat.date === expectedDate) {
        tempStreak++;
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak;
        }
      } else {
        // Check if there's a gap
        const dayDiff = this.getDayDifference(stat.date, expectedDate);
        if (dayDiff > 1) {
          // Streak broken
          if (currentStreak === 0) {
            currentStreak = tempStreak;
          }
          tempStreak = 1; // Start new streak with this day
          if (1 > longestStreak) {
            longestStreak = 1;
          }
        } else {
          tempStreak++;
          if (tempStreak > longestStreak) {
            longestStreak = tempStreak;
          }
        }
      }

      // Move to previous day
      expectedDate = this.getPreviousDateString(expectedDate);
    }

    if (currentStreak === 0) {
      currentStreak = tempStreak;
    }

    stats.currentStreak = currentStreak;
    stats.longestStreak = Math.max(longestStreak, stats.longestStreak);
  }

  async getTodayStats(): Promise<DailyStat | null> {
    const stats = await this.getStats();
    const today = this.getTodayDateString();
    return stats.dailyStats.find((s) => s.date === today) || null;
  }

  async getWeekStats(): Promise<DailyStat[]> {
    const stats = await this.getStats();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoString = this.formatDate(weekAgo);

    return stats.dailyStats
      .filter((s) => s.date >= weekAgoString)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async clearStats(): Promise<void> {
    this.cache = null;
    await AsyncStorage.removeItem(STATS_STORAGE_KEY);
  }

  private getTodayDateString(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private getPreviousDateString(dateString: string): string {
    const date = new Date(dateString);
    date.setDate(date.getDate() - 1);
    return this.formatDate(date);
  }

  private getDayDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

export const statsService = new StatsService();

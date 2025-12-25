import AsyncStorage from '@react-native-async-storage/async-storage';
import { statsService } from '../statsService';
import type { Session, UserStats } from '@flowmate/shared';

describe('StatsService', () => {
  beforeEach(() => {
    // Clear the cache by directly accessing the private property
    // This is necessary because the statsService is a singleton
    (statsService as any).cache = null;

    // Reset specific AsyncStorage mocks
    (AsyncStorage.getItem as jest.Mock).mockReset().mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockReset().mockResolvedValue(undefined);
    (AsyncStorage.removeItem as jest.Mock).mockReset().mockResolvedValue(undefined);
  });

  describe('getStats', () => {
    it('should return default stats when no data is stored', async () => {
      const stats = await statsService.getStats();

      expect(stats).toEqual({
        dailyStats: [],
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 0,
        totalSessions: 0,
      });
    });

    it('should load stats from AsyncStorage', async () => {
      const mockStats: UserStats = {
        dailyStats: [{ date: '2025-12-25', focusTimeMinutes: 60, sessionsCompleted: 2 }],
        currentStreak: 5,
        longestStreak: 10,
        totalFocusTime: 300,
        totalSessions: 15,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockStats));

      const stats = await statsService.getStats();

      expect(stats).toEqual(mockStats);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith('@flowmate:stats');
    });

    it('should use cache on subsequent calls', async () => {
      const mockStats: UserStats = {
        dailyStats: [],
        currentStreak: 1,
        longestStreak: 1,
        totalFocusTime: 25,
        totalSessions: 1,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(JSON.stringify(mockStats));

      // First call - loads from storage
      await statsService.getStats();
      // Second call - uses cache
      await statsService.getStats();

      expect(AsyncStorage.getItem).toHaveBeenCalledTimes(1);
    });

    it('should return default stats on error', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(new Error('Storage error'));

      const stats = await statsService.getStats();

      expect(stats).toEqual({
        dailyStats: [],
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 0,
        totalSessions: 0,
      });
    });
  });

  describe('saveStats', () => {
    it('should save stats to AsyncStorage', async () => {
      const stats: UserStats = {
        dailyStats: [{ date: '2025-12-25', focusTimeMinutes: 30, sessionsCompleted: 1 }],
        currentStreak: 1,
        longestStreak: 1,
        totalFocusTime: 30,
        totalSessions: 1,
      };

      await statsService.saveStats(stats);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        '@flowmate:stats',
        JSON.stringify(stats)
      );
    });

    it('should update cache', async () => {
      const stats: UserStats = {
        dailyStats: [],
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 0,
        totalSessions: 0,
      };

      await statsService.saveStats(stats);

      // Next getStats call should use cache (not call AsyncStorage.getItem)
      (AsyncStorage.getItem as jest.Mock).mockClear();
      const retrievedStats = await statsService.getStats();

      expect(retrievedStats).toEqual(stats);
      expect(AsyncStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('recordSession', () => {
    it('should record a focus session and update stats', async () => {
      const session: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalFocusTime).toBe(25);
      expect(stats.dailyStats.length).toBe(1);
      expect(stats.dailyStats[0].focusTimeMinutes).toBe(25);
      expect(stats.dailyStats[0].sessionsCompleted).toBe(1);
    });

    it('should record a settle session and count it toward focus time', async () => {
      const session: Session = {
        id: '2',
        type: 'settle',
        durationMinutes: 5,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalFocusTime).toBe(5);
      expect(stats.dailyStats[0].focusTimeMinutes).toBe(5);
    });

    it('should record a break session but not count it toward focus time', async () => {
      const session: Session = {
        id: '3',
        type: 'break',
        durationMinutes: 5,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalFocusTime).toBe(0);
      expect(stats.dailyStats[0].focusTimeMinutes).toBe(0);
      expect(stats.dailyStats[0].sessionsCompleted).toBe(1);
    });

    it('should record a wrap session but not count it toward focus time', async () => {
      const session: Session = {
        id: '4',
        type: 'wrap',
        durationMinutes: 3,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      expect(stats.totalSessions).toBe(1);
      expect(stats.totalFocusTime).toBe(0);
      expect(stats.dailyStats[0].focusTimeMinutes).toBe(0);
    });

    it('should accumulate sessions on the same day', async () => {
      const session1: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      const session2: Session = {
        id: '2',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session1);
      await statsService.recordSession(session2);

      const stats = await statsService.getStats();

      expect(stats.totalSessions).toBe(2);
      expect(stats.totalFocusTime).toBe(50);
      expect(stats.dailyStats.length).toBe(1);
      expect(stats.dailyStats[0].focusTimeMinutes).toBe(50);
      expect(stats.dailyStats[0].sessionsCompleted).toBe(2);
    });

    it('should update current streak when recording sessions', async () => {
      const session: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      expect(stats.currentStreak).toBeGreaterThan(0);
    });
  });

  describe('getTodayStats', () => {
    it('should return null when no stats for today', async () => {
      const todayStats = await statsService.getTodayStats();
      expect(todayStats).toBeNull();
    });

    it('should return today\'s stats when available', async () => {
      const session: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const todayStats = await statsService.getTodayStats();

      expect(todayStats).not.toBeNull();
      expect(todayStats?.focusTimeMinutes).toBe(25);
      expect(todayStats?.sessionsCompleted).toBe(1);
    });
  });

  describe('getWeekStats', () => {
    it('should return empty array when no stats', async () => {
      const weekStats = await statsService.getWeekStats();
      expect(weekStats).toEqual([]);
    });

    it('should return stats sorted by date', async () => {
      // Create mock stats with different dates
      const mockStats: UserStats = {
        dailyStats: [
          { date: '2025-12-20', focusTimeMinutes: 25, sessionsCompleted: 1 },
          { date: '2025-12-22', focusTimeMinutes: 50, sessionsCompleted: 2 },
          { date: '2025-12-19', focusTimeMinutes: 30, sessionsCompleted: 1 },
        ],
        currentStreak: 3,
        longestStreak: 3,
        totalFocusTime: 105,
        totalSessions: 4,
      };

      await statsService.saveStats(mockStats);
      const weekStats = await statsService.getWeekStats();

      // Should be sorted ascending by date
      expect(weekStats[0].date).toBe('2025-12-19');
      expect(weekStats[1].date).toBe('2025-12-20');
      expect(weekStats[2].date).toBe('2025-12-22');
    });
  });

  describe('clearStats', () => {
    it('should clear cache and storage', async () => {
      const session: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 25,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      await statsService.clearStats();

      const stats = await statsService.getStats();

      expect(stats).toEqual({
        dailyStats: [],
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 0,
        totalSessions: 0,
      });
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith('@flowmate:stats');
    });
  });

  describe('streak calculation', () => {
    it('should calculate current streak correctly for consecutive days', async () => {
      // Mock consecutive days with sessions
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const twoDaysAgo = new Date(today);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const mockStats: UserStats = {
        dailyStats: [
          { date: formatDate(twoDaysAgo), focusTimeMinutes: 25, sessionsCompleted: 1 },
          { date: formatDate(yesterday), focusTimeMinutes: 25, sessionsCompleted: 1 },
          { date: formatDate(today), focusTimeMinutes: 25, sessionsCompleted: 1 },
        ],
        currentStreak: 0,
        longestStreak: 0,
        totalFocusTime: 75,
        totalSessions: 3,
      };

      await statsService.saveStats(mockStats);

      // Record a session to trigger streak update
      const session: Session = {
        id: '1',
        type: 'focus',
        durationMinutes: 1,
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
      };

      await statsService.recordSession(session);
      const stats = await statsService.getStats();

      // After recording a session on today (which already has sessions),
      // the streak should include all consecutive days
      expect(stats.currentStreak).toBeGreaterThanOrEqual(2);
      expect(stats.longestStreak).toBeGreaterThanOrEqual(2);
    });
  });
});

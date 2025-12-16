import { UserStats, DailyStats } from "../types";

const STATS_STORAGE_KEY = "flowmate_user_stats";

// Get today's date in YYYY-MM-DD format
export const getTodayDate = (): string => {
  const now = new Date();
  return now.toISOString().split("T")[0];
};

// Initialize empty stats
export const getEmptyStats = (): UserStats => ({
  dailyStats: [],
  currentStreak: 0,
  longestStreak: 0,
  totalFocusTime: 0,
  totalSessions: 0,
});

// Load stats from localStorage
export const loadStats = (): UserStats => {
  if (typeof window === "undefined") return getEmptyStats();

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) return getEmptyStats();

    const stats = JSON.parse(stored) as UserStats;
    // Recalculate streak on load in case days were missed
    return recalculateStreak(stats);
  } catch (error) {
    console.error("Failed to load stats:", error);
    return getEmptyStats();
  }
};

// Save stats to localStorage
export const saveStats = (stats: UserStats): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats:", error);
  }
};

// Get today's stats or create new entry
export const getTodayStats = (stats: UserStats): DailyStats => {
  const today = getTodayDate();
  const todayStats = stats.dailyStats.find((s) => s.date === today);

  if (todayStats) {
    return todayStats;
  }

  // Create new entry for today
  return {
    date: today,
    focusTimeMinutes: 0,
    sessionsCompleted: 0,
  };
};

// Add completed focus session to stats
export const addFocusSession = (
  stats: UserStats,
  focusTimeMinutes: number
): UserStats => {
  const today = getTodayDate();
  const updatedDailyStats = [...stats.dailyStats];

  // Find or create today's stats
  const todayIndex = updatedDailyStats.findIndex((s) => s.date === today);

  if (todayIndex >= 0) {
    // Update existing entry
    updatedDailyStats[todayIndex] = {
      ...updatedDailyStats[todayIndex],
      focusTimeMinutes:
        updatedDailyStats[todayIndex].focusTimeMinutes + focusTimeMinutes,
      sessionsCompleted: updatedDailyStats[todayIndex].sessionsCompleted + 1,
    };
  } else {
    // Create new entry
    updatedDailyStats.push({
      date: today,
      focusTimeMinutes,
      sessionsCompleted: 1,
    });
  }

  // Sort by date (newest first)
  updatedDailyStats.sort((a, b) => b.date.localeCompare(a.date));

  const updatedStats: UserStats = {
    dailyStats: updatedDailyStats,
    currentStreak: 0, // Will be calculated next
    longestStreak: stats.longestStreak,
    totalFocusTime: stats.totalFocusTime + focusTimeMinutes,
    totalSessions: stats.totalSessions + 1,
  };

  return recalculateStreak(updatedStats);
};

// Calculate current streak
export const recalculateStreak = (stats: UserStats): UserStats => {
  if (stats.dailyStats.length === 0) {
    return { ...stats, currentStreak: 0 };
  }

  // Sort by date descending (newest first)
  const sortedStats = [...stats.dailyStats].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  const today = getTodayDate();
  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check if user has a session today or yesterday (to allow for streak continuation)
  const latestSessionDate = sortedStats[0].date;
  const latestDate = new Date(latestSessionDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor(
    (todayDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  // If more than 1 day gap, streak is broken
  if (diffDays > 1) {
    return { ...stats, currentStreak: 0 };
  }

  // Count consecutive days backwards from today
  for (let i = 0; i < sortedStats.length; i++) {
    const dateStr = checkDate.toISOString().split("T")[0];
    const hasStatsForDate = sortedStats.find((s) => s.date === dateStr);

    if (hasStatsForDate && hasStatsForDate.sessionsCompleted > 0) {
      currentStreak++;
      // Move to previous day
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const longestStreak = Math.max(stats.longestStreak, currentStreak);

  return {
    ...stats,
    currentStreak,
    longestStreak,
  };
};

// Format minutes to hours and minutes
export const formatFocusTime = (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (mins === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${mins}m`;
};

// Get stats for last N days
export const getRecentStats = (stats: UserStats, days: number = 7): DailyStats[] => {
  const sortedStats = [...stats.dailyStats].sort((a, b) =>
    b.date.localeCompare(a.date)
  );

  return sortedStats.slice(0, days);
};

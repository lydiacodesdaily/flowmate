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
  totalFocusTime: 0,
  totalSessions: 0,
});

// Load stats from localStorage
export const loadStats = (): UserStats => {
  if (typeof window === "undefined") return getEmptyStats();

  try {
    const stored = localStorage.getItem(STATS_STORAGE_KEY);
    if (!stored) return getEmptyStats();

    return JSON.parse(stored) as UserStats;
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
    sessionsSaved: 0,
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
      sessionsSaved: updatedDailyStats[todayIndex].sessionsSaved + 1,
    };
  } else {
    // Create new entry
    updatedDailyStats.push({
      date: today,
      focusTimeMinutes,
      sessionsSaved: 1,
    });
  }

  // Sort by date (newest first)
  updatedDailyStats.sort((a, b) => b.date.localeCompare(a.date));

  const updatedStats: UserStats = {
    dailyStats: updatedDailyStats,
    totalFocusTime: stats.totalFocusTime + focusTimeMinutes,
    totalSessions: stats.totalSessions + 1,
  };

  return updatedStats;
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

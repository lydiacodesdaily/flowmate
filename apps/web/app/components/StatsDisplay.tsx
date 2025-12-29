"use client";

import { UserStats } from "../types";
import { getTodayStats, formatFocusTime } from "../utils/statsUtils";

interface StatsDisplayProps {
  stats: UserStats;
}

export const StatsDisplay = ({ stats }: StatsDisplayProps) => {
  const todayStats = getTodayStats(stats);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-800/50 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-cyan-700/50 backdrop-blur-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-1">
          Your Stats
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Track your focus journey
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Today's Focus Time */}
        <div className="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-blue-200/50 dark:border-cyan-600/30">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Today
          </div>
          <div className="text-2xl font-bold text-blue-600 dark:text-cyan-400">
            {formatFocusTime(todayStats.focusTimeMinutes)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {todayStats.sessionsSaved} {todayStats.sessionsSaved === 1 ? 'session' : 'sessions'}
          </div>
        </div>

        {/* Total Focus Time */}
        <div className="bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-purple-200/50 dark:border-purple-600/30">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Total Focus
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {formatFocusTime(stats.totalFocusTime)}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            all time
          </div>
        </div>

        {/* Sessions Saved */}
        <div className="col-span-2 bg-white/60 dark:bg-slate-700/40 backdrop-blur-sm rounded-xl p-4 border border-green-200/50 dark:border-green-600/30">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide text-center">
            Sessions Saved
          </div>
          <div className="text-2xl font-bold text-green-600 dark:text-green-400 text-center">
            {stats.totalSessions}
          </div>
        </div>
      </div>
    </div>
  );
};

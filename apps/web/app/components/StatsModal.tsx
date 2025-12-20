"use client";

import { UserStats } from "../types";
import { StatsDisplay } from "./StatsDisplay";

interface StatsModalProps {
  showStats: boolean;
  setShowStats: (show: boolean) => void;
  userStats: UserStats | null;
}

export const StatsModal = ({
  showStats,
  setShowStats,
  userStats,
}: StatsModalProps) => {
  if (!showStats) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={() => setShowStats(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
            Your Stats
          </h2>
          <button
            onClick={() => setShowStats(false)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors"
            aria-label="Close stats"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-slate-600 dark:text-slate-300"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {userStats ? (
            <StatsDisplay stats={userStats} />
          ) : (
            <div className="text-center py-12 text-slate-600 dark:text-slate-300">
              <div className="text-6xl mb-4">📊</div>
              <p>No stats yet. Complete your first focus session to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

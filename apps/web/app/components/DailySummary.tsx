"use client";

import { SessionRecord } from "../types";
import { getTodaysSessions, getTodayStats, getAllTimeTotalMinutes, getAllTimeSavedSessions, formatDuration, formatTime } from "../utils/sessionUtils";
import { formatFocusTime } from "../utils/statsUtils";

interface DailySummaryProps {
  onClose: () => void;
}

export const DailySummary = ({ onClose }: DailySummaryProps) => {
  const todaySessions = getTodaysSessions();
  const todayStats = getTodayStats();
  const allTimeMinutes = getAllTimeTotalMinutes();
  const allTimeSessions = getAllTimeSavedSessions();

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'pomodoro': return 'Pomodoro';
      case 'guided': return 'Guided';
      case 'custom': return 'Custom';
      default: return mode;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 dark:text-green-400';
      case 'partial': return 'text-yellow-600 dark:text-yellow-400';
      case 'skipped': return 'text-slate-400 dark:text-slate-500';
      default: return 'text-slate-600 dark:text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✓';
      case 'partial': return '◐';
      case 'skipped': return '⊘';
      default: return '·';
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-2xl w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Daily Summary</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-slate-600 dark:text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Today's Stats */}
        <div className="mb-6 grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700/50 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-cyan-700/50">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
              Today
            </div>
            <div className="text-3xl font-bold text-blue-600 dark:text-cyan-400 mb-1">
              {formatFocusTime(todayStats.totalMinutes)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {todayStats.sessionCount} {todayStats.sessionCount === 1 ? 'session' : 'sessions'}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-700/50 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
            <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
              Total Focus
            </div>
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
              {formatFocusTime(allTimeMinutes)}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              all time
            </div>
          </div>
        </div>

        <div className="mb-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
          <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide text-center">
            Sessions Saved
          </div>
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 text-center">
            {allTimeSessions}
          </div>
        </div>

        {/* Today's Sessions List */}
        <div>
          <h3 className="text-lg font-semibold text-slate-700 dark:text-cyan-400 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
            Today's Sessions
          </h3>

          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm">No sessions yet today.</p>
              <p className="text-xs mt-2">Start a focus session to see it here!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className="bg-slate-50 dark:bg-slate-700/30 rounded-xl p-4 border border-slate-200 dark:border-slate-600/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all"
                >
                  {/* Header Row */}
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg font-semibold ${getStatusColor(session.status)}`}>
                        {getStatusIcon(session.status)}
                      </span>
                      <div>
                        <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {formatTime(session.startedAt)}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {getModeLabel(session.mode)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        {formatDuration(session.completedSeconds)}
                      </div>
                      {session.plannedSeconds !== session.completedSeconds && (
                        <div className="text-xs text-slate-400">
                          of {formatDuration(session.plannedSeconds)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Intent */}
                  {session.intent && (
                    <div className="text-sm text-slate-600 dark:text-slate-400 italic mb-2">
                      "{session.intent}"
                    </div>
                  )}

                  {/* Steps Summary */}
                  {session.steps && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                      Steps: {session.steps.done}/{session.steps.total}
                    </div>
                  )}

                  {/* Note */}
                  {session.note && (
                    <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700/50 rounded p-2 mt-2">
                      {session.note}
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      session.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                      session.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                      'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      {session.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

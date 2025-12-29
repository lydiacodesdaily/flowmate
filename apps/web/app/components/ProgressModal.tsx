"use client";

import { useState } from "react";
import { SessionRecord } from "../types";
import {
  getTodaysSessions,
  getTodayStats,
  getAllTimeTotalMinutes,
  getAllTimeSavedSessions,
  formatDuration,
  formatTime,
  formatDate,
  groupSessionsByDay,
  DailySummary
} from "../utils/sessionUtils";
import { formatFocusTime } from "../utils/statsUtils";

interface ProgressModalProps {
  onClose: () => void;
}

type ViewMode = "today" | "history";

export const ProgressModal = ({ onClose }: ProgressModalProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("today");
  const [expandedDay, setExpandedDay] = useState<string | null>(null);

  const todaySessions = getTodaysSessions();
  const todayStats = getTodayStats();
  const allTimeMinutes = getAllTimeTotalMinutes();
  const allTimeSessions = getAllTimeSavedSessions();
  const dailySummaries = groupSessionsByDay();

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

  const renderSessionCard = (session: SessionRecord, showDate: boolean = false) => (
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
              {showDate ? formatDate(session.startedAt) : formatTime(session.startedAt)}
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
        <div className="mb-2 flex items-start gap-2">
          <span className="text-cyan-600 dark:text-cyan-400 text-xs mt-0.5">→</span>
          <p className="flex-1 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {session.intent}
          </p>
        </div>
      )}

      {/* Steps Summary */}
      {session.steps && session.steps.total > 0 && (
        <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
          {session.steps.done} of {session.steps.total} steps completed
        </div>
      )}

      {/* Note */}
      {session.note && (
        <div className="text-xs text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-700/50 rounded-lg p-2 mt-2">
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
  );

  const renderDailySummaryCard = (summary: DailySummary) => {
    const isExpanded = expandedDay === summary.date;
    const totalSessions = summary.sessions.length;

    return (
      <div
        key={summary.date}
        className="bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-700/40 dark:to-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-600/50 overflow-hidden transition-all"
      >
        {/* Summary Header - Always Visible */}
        <button
          onClick={() => setExpandedDay(isExpanded ? null : summary.date)}
          className="w-full p-4 text-left hover:bg-slate-100/50 dark:hover:bg-slate-700/30 transition-all"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📅</div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  {summary.displayDate}
                </h3>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {totalSessions} session{totalSessions !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
                  {formatFocusTime(summary.totalMinutes)}
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  total focus
                </div>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>
          </div>

          {/* Session Status Summary */}
          <div className="flex gap-3 text-xs">
            {summary.completedCount > 0 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <span className="font-semibold">✓</span>
                <span>{summary.completedCount} completed</span>
              </div>
            )}
            {summary.partialCount > 0 && (
              <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                <span className="font-semibold">◐</span>
                <span>{summary.partialCount} partial</span>
              </div>
            )}
            {summary.skippedCount > 0 && (
              <div className="flex items-center gap-1 text-slate-400 dark:text-slate-500">
                <span className="font-semibold">⊘</span>
                <span>{summary.skippedCount} skipped</span>
              </div>
            )}
          </div>
        </button>

        {/* Expanded Session Details */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-2 border-t border-slate-200 dark:border-slate-600/30 pt-3">
            {summary.sessions.map((session) => renderSessionCard(session, false))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Your Progress</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-slate-600 dark:text-slate-400"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats Summary - Always Visible */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-slate-700/50 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-cyan-700/50 text-center">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Today
              </div>
              <div className="text-2xl font-bold text-blue-600 dark:text-cyan-400">
                {formatFocusTime(todayStats.totalMinutes)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {todayStats.sessionCount} session{todayStats.sessionCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-slate-700/50 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50 text-center">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                All Time
              </div>
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatFocusTime(allTimeMinutes)}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                total focus
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-slate-700/50 dark:to-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50 text-center">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Sessions
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {allTimeSessions}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                saved
              </div>
            </div>
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode("today")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              viewMode === "today"
                ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={`flex-1 px-6 py-3 text-sm font-medium transition-all ${
              viewMode === "history"
                ? "text-cyan-600 dark:text-cyan-400 border-b-2 border-cyan-600 dark:border-cyan-400 bg-cyan-50/50 dark:bg-cyan-900/10"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/30"
            }`}
          >
            History ({dailySummaries.length} days)
          </button>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "today" ? (
            todaySessions.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-sm font-medium">No sessions yet today</p>
                <p className="text-xs mt-2">Start a focus session to begin tracking!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3 uppercase tracking-wide">
                  Today's Sessions
                </h3>
                {todaySessions.map((session) => renderSessionCard(session, false))}
              </div>
            )
          ) : (
            dailySummaries.length === 0 ? (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <div className="text-5xl mb-3">📚</div>
                <p className="text-sm font-medium">No session history yet</p>
                <p className="text-xs mt-2">Complete sessions to build your history!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wide">
                    Daily Summary
                  </h3>
                  <div className="text-xs text-slate-400 dark:text-slate-500">
                    Last 30 sessions · Stored locally
                  </div>
                </div>
                {dailySummaries.map((summary) => renderDailySummaryCard(summary))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

"use client";

import { useState } from "react";
import { SessionRecord } from "../types";
import {
  getTodayStats,
  getAllTimeTotalMinutes,
  getAllTimeSavedSessions,
  formatDuration,
  formatTime,
  groupSessionsByDay,
  isResumable,
  DailySummary
} from "../utils/sessionUtils";
import { formatFocusTime } from "../utils/statsUtils";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface ProgressModalProps {
  onClose: () => void;
  onResume?: (session: SessionRecord) => void;
  onContinueToday?: (session: SessionRecord) => void;
}

export const ProgressModal = ({ onClose, onResume, onContinueToday }: ProgressModalProps) => {
  const todayKey = getTodayKey();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([todayKey]));
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const todayStats = getTodayStats();
  const allTimeMinutes = getAllTimeTotalMinutes();
  const allTimeSessions = getAllTimeSavedSessions();
  const dailySummaries = groupSessionsByDay();

  const toggleDay = (date: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });
  };

  const toggleSteps = (id: string) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
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

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'pomodoro': return 'Pomodoro';
      case 'guided': return 'Guided';
      case 'custom': return 'Custom';
      default: return mode;
    }
  };

  const renderSessionCard = (session: SessionRecord) => {
    const isBreak = session.timerType === 'break';
    const stepsExpanded = expandedSteps.has(session.id);
    const hasStepDetail = (session.stepsDetail?.length ?? 0) > 0;

    return (
      <div
        key={session.id}
        className={`rounded-xl border transition-all ${
          isBreak
            ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-700/30'
            : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-600/40'
        }`}
      >
        <div className="p-3">
          {/* Top line: status icon · time · mode · duration */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`text-sm font-semibold flex-shrink-0 ${getStatusColor(session.status)}`}>
                {getStatusIcon(session.status)}
              </span>
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex-shrink-0">
                {formatTime(session.startedAt)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                {getModeLabel(session.mode)}
              </span>
              {isBreak && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-medium flex-shrink-0">
                  Break
                </span>
              )}
            </div>
            <div className="flex-shrink-0 text-right">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {formatDuration(session.completedSeconds)}
              </span>
              {session.plannedSeconds !== session.completedSeconds && (
                <span className="text-xs text-slate-400 ml-1">
                  / {formatDuration(session.plannedSeconds)}
                </span>
              )}
            </div>
          </div>

          {/* Intent */}
          {session.intent && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-5 mb-1">
              {session.intent}
            </p>
          )}

          {/* Steps toggle (if stepsDetail available) */}
          {hasStepDetail && (
            <button
              onClick={() => toggleSteps(session.id)}
              className="flex items-center gap-1 pl-5 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <span>{session.steps!.done}/{session.stepsDetail!.length} steps</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className={`w-3 h-3 transition-transform ${stepsExpanded ? 'rotate-180' : ''}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}

          {/* Steps count only (no detail stored) */}
          {!hasStepDetail && session.steps && session.steps.total > 0 && (
            <div className="pl-5 text-xs text-slate-500 dark:text-slate-400">
              {session.steps.done}/{session.steps.total} steps
            </div>
          )}

          {/* Expanded step list */}
          {stepsExpanded && session.stepsDetail && (
            <div className="pl-5 mt-1.5 space-y-1">
              {session.stepsDetail.map(step => (
                <div key={step.id} className="flex items-start gap-1.5 text-xs">
                  <span className={`flex-shrink-0 mt-px ${step.done ? 'text-green-500 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`}>
                    {step.done ? '✓' : '○'}
                  </span>
                  <span className={`leading-relaxed ${step.done ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-600 dark:text-slate-300'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Note */}
          {session.note && (
            <div className="pl-5 mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2">
              {session.note}
            </div>
          )}

          {/* Status badge + action button */}
          <div className="flex items-center justify-between mt-2 pl-5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${
              session.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
              session.status === 'partial' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
              'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500'
            }`}>
              {session.status}
            </span>

            {session.timerType === 'focus' && session.status !== 'skipped' && (
              session.status === 'partial' && isResumable(session) ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onResume?.(session); }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-colors"
                >
                  Resume
                </button>
              ) : session.status === 'partial' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onContinueToday?.(session); }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Continue Today
                </button>
              ) : session.status === 'completed' ? (
                <button
                  onClick={(e) => { e.stopPropagation(); onContinueToday?.(session); }}
                  className="text-xs font-semibold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-colors"
                >
                  Repeat
                </button>
              ) : null
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderDayGroup = (summary: DailySummary) => {
    const isExpanded = expandedDays.has(summary.date);

    return (
      <div key={summary.date} className="py-1">
        {/* Day group header */}
        <button
          onClick={() => toggleDay(summary.date)}
          className="w-full flex items-center justify-between py-2 px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
        >
          <div className="flex items-center gap-2.5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className={`w-3.5 h-3.5 text-slate-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {summary.displayDate}
            </span>
            <div className="flex gap-2 text-xs">
              {summary.completedCount > 0 && (
                <span className="text-green-600 dark:text-green-400">✓{summary.completedCount}</span>
              )}
              {summary.partialCount > 0 && (
                <span className="text-yellow-600 dark:text-yellow-400">◐{summary.partialCount}</span>
              )}
              {summary.skippedCount > 0 && (
                <span className="text-slate-400 dark:text-slate-500">⊘{summary.skippedCount}</span>
              )}
              {summary.breakCount > 0 && (
                <span className="text-emerald-600 dark:text-emerald-400">☕{summary.breakCount}</span>
              )}
            </div>
          </div>
          <span className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex-shrink-0">
            {formatFocusTime(summary.totalMinutes)}
          </span>
        </button>

        {/* Expanded sessions */}
        {isExpanded && (
          <div className="space-y-2 mt-1 mb-2">
            {summary.sessions.map(renderSessionCard)}
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Progress</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-slate-600 dark:text-slate-400"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats strip */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Today</div>
            <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{formatFocusTime(todayStats.totalMinutes)}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{todayStats.sessionCount} session{todayStats.sessionCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">All time</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatFocusTime(allTimeMinutes)}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{allTimeSessions} session{allTimeSessions !== 1 ? 's' : ''}</div>
          </div>
        </div>

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {dailySummaries.length === 0 ? (
            <div className="text-center py-16 text-slate-500 dark:text-slate-400">
              <div className="text-5xl mb-3">🎯</div>
              <p className="text-sm font-medium">No sessions yet</p>
              <p className="text-xs mt-2">Start a focus session to begin tracking!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {dailySummaries.map(renderDayGroup)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

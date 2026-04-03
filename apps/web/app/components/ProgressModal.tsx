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
  updateHistoryRecord,
  deleteHistoryRecord,
  addManualSession,
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
  isPremium?: boolean;
  onUpgrade?: () => void;
}

/** 12-week calendar heatmap — premium only */
function FocusHeatmap({ summaries }: { summaries: DailySummary[] }) {
  const statsMap = new Map<string, number>();
  summaries.forEach(s => statsMap.set(s.date, s.totalMinutes));

  // Build 84 days (12 weeks) ending today
  const days: { key: string; minutes: number }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    days.push({ key, minutes: statsMap.get(key) ?? 0 });
  }

  const getColor = (minutes: number) => {
    if (minutes === 0) return 'bg-slate-100 dark:bg-slate-700/50';
    const intensity = Math.min(1, minutes / 120);
    if (intensity < 0.25) return 'bg-cyan-100 dark:bg-cyan-900/50';
    if (intensity < 0.5) return 'bg-cyan-300 dark:bg-cyan-700';
    if (intensity < 0.75) return 'bg-cyan-500 dark:bg-cyan-500';
    return 'bg-cyan-600 dark:bg-cyan-400';
  };

  return (
    <div className="mt-2 mb-3">
      <div className="flex flex-wrap gap-0.5">
        {days.map(({ key, minutes }) => (
          <div
            key={key}
            title={`${key}: ${minutes}m`}
            className={`w-3 h-3 rounded-sm ${getColor(minutes)}`}
          />
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-slate-400">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-700/50" />
        <div className="w-3 h-3 rounded-sm bg-cyan-100 dark:bg-cyan-900/50" />
        <div className="w-3 h-3 rounded-sm bg-cyan-300 dark:bg-cyan-700" />
        <div className="w-3 h-3 rounded-sm bg-cyan-600 dark:bg-cyan-400" />
        <span>More</span>
      </div>
    </div>
  );
}

/** Compute current streak: consecutive days (going back from today) with ≥1 focus session */
function computeCurrentStreak(summaries: DailySummary[]): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let streak = 0;
  let cursor = new Date(today);

  for (let i = 0; i < summaries.length; i++) {
    const dayKey = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    const summary = summaries.find(s => s.date === dayKey);
    if (!summary || (summary.completedCount + summary.partialCount) === 0) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

/** Compute all-time completion rate across focus sessions */
function computeCompletionRate(summaries: DailySummary[]): number | null {
  let completed = 0;
  let total = 0;
  summaries.forEach(s => {
    completed += s.completedCount + s.partialCount;
    total += s.completedCount + s.partialCount + s.skippedCount;
  });
  if (total === 0) return null;
  return Math.round((completed / total) * 100);
}

export const ProgressModal = ({ onClose, onResume, onContinueToday, isPremium = false, onUpgrade }: ProgressModalProps) => {
  const todayKey = getTodayKey();
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([todayKey]));
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editIntent, setEditIntent] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [logMinutes, setLogMinutes] = useState(25);
  const [logIntent, setLogIntent] = useState('');
  const [, forceRefresh] = useState(0);

  const refresh = () => forceRefresh(n => n + 1);

  const todayStats = getTodayStats();
  const allTimeMinutes = getAllTimeTotalMinutes(isPremium);
  const allTimeSessions = getAllTimeSavedSessions(isPremium);
  const dailySummaries = groupSessionsByDay(isPremium);

  const currentStreak = isPremium ? computeCurrentStreak(dailySummaries) : null;
  const completionRate = isPremium ? computeCompletionRate(dailySummaries) : null;

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

  const startEdit = (session: SessionRecord) => {
    setEditingId(session.id);
    setEditMinutes(Math.max(1, Math.round(session.completedSeconds / 60)));
    setEditIntent(session.intent ?? '');
  };

  const cancelEdit = () => setEditingId(null);

  const saveEdit = (session: SessionRecord) => {
    const newSeconds = editMinutes * 60;
    const updates: Parameters<typeof updateHistoryRecord>[1] = { editedAt: Date.now() };
    if (newSeconds !== session.completedSeconds) {
      if (!session.originalCompletedSeconds) updates.originalCompletedSeconds = session.completedSeconds;
      updates.completedSeconds = newSeconds;
      updates.plannedSeconds = newSeconds;
    }
    const trimmedIntent = editIntent.trim();
    if (trimmedIntent !== (session.intent ?? '')) updates.intent = trimmedIntent || undefined;
    updateHistoryRecord(session.id, updates);
    setEditingId(null);
    refresh();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Remove this session?')) return;
    deleteHistoryRecord(id);
    refresh();
  };

  const handleLogSession = () => {
    if (logMinutes < 1) return;
    addManualSession(logMinutes, logIntent.trim() || undefined);
    setShowLogForm(false);
    setLogMinutes(25);
    setLogIntent('');
    refresh();
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
    const isEditing = editingId === session.id;
    const isAdjusted = !!session.editedAt || !!session.isManual;

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
                {session.isManual ? 'manual · ' : ''}{formatTime(session.startedAt)}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 flex-shrink-0">
                {getModeLabel(session.mode)}
              </span>
              {isBreak && (
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 font-medium flex-shrink-0">
                  Break
                </span>
              )}
              {isAdjusted && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 font-medium flex-shrink-0">
                  {session.isManual ? 'manual' : 'adjusted'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                {formatDuration(session.completedSeconds)}
              </span>
              {session.plannedSeconds !== session.completedSeconds && !session.isManual && (
                <span className="text-xs text-slate-400 ml-1">
                  / {formatDuration(session.plannedSeconds)}
                </span>
              )}
              {!isEditing && (
                <button
                  onClick={() => startEdit(session)}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors px-1"
                  title="Edit session"
                >
                  Edit
                </button>
              )}
            </div>
          </div>

          {/* Inline edit form */}
          {isEditing && (
            <div className="mt-2 mb-1 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/40 space-y-3">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust anything that doesn't look right.
              </p>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-16 flex-shrink-0">
                  Duration
                </label>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditMinutes(m => Math.max(1, m - 5))}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-base font-light hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >−</button>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={editMinutes}
                      onChange={e => setEditMinutes(Math.max(1, Math.min(1440, parseInt(e.target.value) || 1)))}
                      className="w-14 text-center text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-1 text-slate-800 dark:text-slate-200"
                      min={1}
                      max={1440}
                    />
                    <span className="text-xs text-slate-400">min</span>
                  </div>
                  <button
                    onClick={() => setEditMinutes(m => Math.min(1440, m + 5))}
                    className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 text-base font-light hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                  >+</button>
                </div>
                {session.originalCompletedSeconds && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    (was {Math.round(session.originalCompletedSeconds / 60)}m)
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-16 flex-shrink-0">
                  Intent
                </label>
                <input
                  type="text"
                  value={editIntent}
                  onChange={e => setEditIntent(e.target.value)}
                  placeholder="e.g. writing, reading…"
                  maxLength={120}
                  className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 text-slate-800 dark:text-slate-200 placeholder-slate-400"
                />
              </div>
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleDelete(session.id)}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Remove session
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={cancelEdit}
                    className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => saveEdit(session)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-colors font-semibold"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Intent */}
          {!isEditing && session.intent && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed pl-5 mb-1">
              {session.intent}
            </p>
          )}

          {/* Steps toggle (if stepsDetail available) */}
          {!isEditing && hasStepDetail && (
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
          {!isEditing && !hasStepDetail && session.steps && session.steps.total > 0 && (
            <div className="pl-5 text-xs text-slate-500 dark:text-slate-400">
              {session.steps.done}/{session.steps.total} steps
            </div>
          )}

          {/* Expanded step list */}
          {!isEditing && stepsExpanded && session.stepsDetail && (
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
          {!isEditing && session.note && (
            <div className="pl-5 mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700/40 rounded-lg p-2">
              {session.note}
            </div>
          )}

          {/* Status badge + action button */}
          {!isEditing && (
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
          )}
        </div>
      </div>
    );
  };

  const renderLogForm = () => (
    <div className="mt-1 mb-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600/40 space-y-3">
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Did some focused work but forgot to start the timer? Add it here — it counts.
      </p>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-16 flex-shrink-0">
          Duration
        </label>
        <div className="flex items-center gap-1.5">
          {[15, 25, 45, 60].map(m => (
            <button
              key={m}
              onClick={() => setLogMinutes(m)}
              className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                logMinutes === m
                  ? 'bg-cyan-500 text-white'
                  : 'bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500'
              }`}
            >
              {m}m
            </button>
          ))}
          <div className="flex items-center gap-1 ml-1">
            <input
              type="number"
              value={logMinutes}
              onChange={e => setLogMinutes(Math.max(1, Math.min(1440, parseInt(e.target.value) || 1)))}
              className="w-14 text-center text-sm font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg py-1 text-slate-800 dark:text-slate-200"
              min={1}
              max={1440}
            />
            <span className="text-xs text-slate-400">min</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide w-16 flex-shrink-0">
          Intent
        </label>
        <input
          type="text"
          value={logIntent}
          onChange={e => setLogIntent(e.target.value)}
          placeholder="e.g. writing, reading… (optional)"
          maxLength={120}
          className="flex-1 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-1 text-slate-800 dark:text-slate-200 placeholder-slate-400"
        />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button
          onClick={() => { setShowLogForm(false); setLogMinutes(25); setLogIntent(''); }}
          className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          onClick={handleLogSession}
          className="text-xs px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white transition-colors font-semibold"
        >
          Log session
        </button>
      </div>
    </div>
  );

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
            {summary.date === todayKey && !showLogForm && (
              <button
                onClick={() => setShowLogForm(true)}
                className="w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2 border border-dashed border-slate-200 dark:border-slate-600 rounded-xl"
              >
                + Log a session I forgot to track
              </button>
            )}
            {summary.date === todayKey && showLogForm && renderLogForm()}
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
        <div className="flex items-center gap-4 px-6 py-3 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
          <div className="flex-shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Today</div>
            <div className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{formatFocusTime(todayStats.totalMinutes)}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{todayStats.sessionCount} session{todayStats.sessionCount !== 1 ? 's' : ''}</div>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
          <div className="flex-shrink-0">
            <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">All time</div>
            <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{formatFocusTime(allTimeMinutes)}</div>
            <div className="text-xs text-slate-400 dark:text-slate-500">{allTimeSessions} session{allTimeSessions !== 1 ? 's' : ''}</div>
          </div>
          {isPremium && currentStreak !== null && currentStreak > 0 && (
            <>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Streak</div>
                <div className="text-xl font-bold text-orange-500 dark:text-orange-400">{currentStreak}🔥</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">day{currentStreak !== 1 ? 's' : ''}</div>
              </div>
            </>
          )}
          {isPremium && completionRate !== null && (
            <>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <div className="flex-shrink-0">
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-0.5">Completion</div>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{completionRate}%</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">all time</div>
              </div>
            </>
          )}
          {!isPremium && onUpgrade && (
            <>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-700 flex-shrink-0" />
              <button
                onClick={onUpgrade}
                className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 dark:border-sky-700 bg-sky-50 dark:bg-sky-900/30 text-sky-600 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-900/50 transition-colors text-xs font-semibold"
              >
                <span>✦</span> Streak &amp; more
              </button>
            </>
          )}
        </div>

        {/* Premium heatmap toggle */}
        {isPremium && dailySummaries.length > 0 && (
          <div className="px-6 pt-2">
            <button
              onClick={() => setShowHeatmap(v => !v)}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors flex items-center gap-1"
            >
              {showHeatmap ? '▲' : '▼'} {showHeatmap ? 'Hide' : 'Show'} activity heatmap
            </button>
            {showHeatmap && <FocusHeatmap summaries={dailySummaries} />}
          </div>
        )}

        {/* Timeline */}
        <div className="flex-1 overflow-y-auto px-5 py-2">
          {dailySummaries.length === 0 ? (
            <div className="py-10 text-slate-500 dark:text-slate-400">
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">🎯</div>
                <p className="text-sm font-medium">Your sessions will show up here</p>
                <p className="text-xs mt-2 text-slate-400">Start a focus session to begin tracking your progress.</p>
              </div>
              {!showLogForm ? (
                <button
                  onClick={() => setShowLogForm(true)}
                  className="w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2.5 border border-dashed border-slate-200 dark:border-slate-600 rounded-xl"
                >
                  + Log a session I forgot to track
                </button>
              ) : renderLogForm()}
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
              <div className="py-1">
                {!showLogForm ? (
                  <button
                    onClick={() => setShowLogForm(true)}
                    className="w-full text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors py-2 border border-dashed border-slate-200 dark:border-slate-600 rounded-xl"
                  >
                    + Log a session I forgot to track
                  </button>
                ) : renderLogForm()}
              </div>
              {dailySummaries.map(renderDayGroup)}
              {!isPremium && (
                <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-4 py-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Showing last 30 days · this device only
                  </p>
                  {onUpgrade && (
                    <button
                      onClick={onUpgrade}
                      className="shrink-0 text-xs font-medium text-sky-600 dark:text-sky-400 hover:underline"
                    >
                      Upgrade for full history
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

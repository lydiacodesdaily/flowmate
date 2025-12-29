"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { SessionDraft, SessionStatus, PrepStep } from "../types";

interface SessionCompleteProps {
  completedMinutes: number;
  onSave: (status: SessionStatus, updatedSteps?: PrepStep[], note?: string) => void;
  onDiscard: () => void;
  sessionDraft?: SessionDraft;
}

const MAX_NOTE_LENGTH = 140;

export const SessionComplete = ({
  completedMinutes,
  onSave,
  onDiscard,
  sessionDraft,
}: SessionCompleteProps) => {
  const [selectedStatus, setSelectedStatus] = useState<SessionStatus | null>(null);
  const [steps, setSteps] = useState<PrepStep[]>([]);
  const [note, setNote] = useState("");
  const [confettiShown, setConfettiShown] = useState(false);
  const hasAutoSavedRef = useRef(false);

  // Load steps from draft
  useEffect(() => {
    if (sessionDraft?.steps) {
      setSteps([...sessionDraft.steps]);
    }
  }, [sessionDraft]);

  // Auto-save on unmount if user hasn't explicitly saved or discarded
  useEffect(() => {
    return () => {
      // Only auto-save if user hasn't explicitly saved/discarded
      if (!hasAutoSavedRef.current) {
        // Default to 'partial' status
        onSave('partial', steps.length > 0 ? steps : undefined, note || undefined);
      }
    };
  }, [steps, note, onSave]);

  const handleToggleStep = (id: string) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, done: !step.done } : step
    ));
  };

  const handleSave = () => {
    if (!selectedStatus) return;

    // Mark that user explicitly saved
    hasAutoSavedRef.current = true;

    // Trigger confetti only once when saving (not per checkbox)
    if (!confettiShown && selectedStatus === 'completed') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22d3ee', '#3b82f6', '#06b6d4'],
      });
      setConfettiShown(true);
    }

    onSave(selectedStatus, steps.length > 0 ? steps : undefined, note || undefined);
  };

  const handleDiscard = () => {
    // Mark that user explicitly discarded
    hasAutoSavedRef.current = true;
    onDiscard();
  };

  const getStepsSummary = () => {
    if (steps.length === 0) return null;
    const doneCount = steps.filter(s => s.done).length;
    return `${doneCount}/${steps.length}`;
  };

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 md:p-10 border border-white/20 dark:border-cyan-500/20">
      <div className="text-center mb-8">
        <div className="text-7xl mb-6">
          {selectedStatus === 'completed' ? '🎉' : selectedStatus === 'partial' ? '👍' : selectedStatus === 'skipped' ? '⏭️' : '✨'}
        </div>
        <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
          Session Complete
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300">
          You focused for {completedMinutes} {completedMinutes === 1 ? 'minute' : 'minutes'}
        </p>
      </div>

      {/* Session Status Selection */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 text-center">
          How did it go?
        </label>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => setSelectedStatus('completed')}
            className={`flex-1 max-w-[140px] px-4 py-3 rounded-xl font-medium transition-all ${
              selectedStatus === 'completed'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setSelectedStatus('partial')}
            className={`flex-1 max-w-[140px] px-4 py-3 rounded-xl font-medium transition-all ${
              selectedStatus === 'partial'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => setSelectedStatus('skipped')}
            className={`flex-1 max-w-[140px] px-4 py-3 rounded-xl font-medium transition-all ${
              selectedStatus === 'skipped'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg scale-105'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            Skipped
          </button>
        </div>
      </div>

      {/* Steps Checklist - Only show if there are steps */}
      {steps.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Steps completed
            </label>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {getStepsSummary()}
            </span>
          </div>
          <div className="space-y-2">
            {steps.map((step, index) => (
              <label
                key={step.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/30 hover:bg-slate-100 dark:hover:bg-slate-700/50 cursor-pointer transition-all group"
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() => handleToggleStep(step.id)}
                  className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-cyan-500 focus:ring-cyan-500 cursor-pointer"
                />
                <span className="text-xs text-slate-400">{index + 1}.</span>
                <span className={`flex-1 text-sm transition-all ${
                  step.done
                    ? 'text-slate-400 dark:text-slate-500 line-through'
                    : 'text-slate-700 dark:text-slate-300'
                }`}>
                  {step.text}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Note */}
      <div className="mb-8">
        <label htmlFor="reflection-note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          What did you actually do? <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          id="reflection-note"
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, MAX_NOTE_LENGTH))}
          placeholder="e.g., Finished outline, got stuck on intro..."
          maxLength={MAX_NOTE_LENGTH}
          rows={3}
          className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all resize-none"
        />
        <div className="text-xs text-slate-400 mt-1 text-right">
          {note.length}/{MAX_NOTE_LENGTH}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="flex gap-3">
          <button
            onClick={handleDiscard}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={!selectedStatus}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-cyan-500 disabled:hover:to-blue-500"
          >
            Save session
          </button>
        </div>
        <p className="text-xs text-center text-slate-400 dark:text-slate-500">
          Don't worry, your session will be auto-saved if you leave
        </p>
      </div>
    </div>
  );
};

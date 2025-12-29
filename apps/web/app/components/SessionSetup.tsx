"use client";

import { useState, useEffect } from "react";
import { SessionDraft, PrepStep } from "../types";
import { getDraft, saveDraft, createPrepStep } from "../utils/sessionUtils";

interface SessionSetupProps {
  onStart: () => void;
  onSkipSetup: () => void;
}

const MAX_INTENT_LENGTH = 80;
const MAX_STEP_LENGTH = 60;
const MAX_STEPS = 5;

export const SessionSetup = ({ onStart, onSkipSetup }: SessionSetupProps) => {
  const [intent, setIntent] = useState("");
  const [steps, setSteps] = useState<PrepStep[]>([]);
  const [newStepText, setNewStepText] = useState("");

  // Load draft on mount
  useEffect(() => {
    const draft = getDraft();
    setIntent(draft.intent);
    setSteps(draft.steps);
  }, []);

  // Save draft whenever intent or steps change
  useEffect(() => {
    saveDraft({ intent, steps });
  }, [intent, steps]);

  const handleAddStep = () => {
    if (newStepText.trim() && steps.length < MAX_STEPS) {
      const newStep = createPrepStep(newStepText);
      setSteps([...steps, newStep]);
      setNewStepText("");
    }
  };

  const handleRemoveStep = (id: string) => {
    setSteps(steps.filter(step => step.id !== id));
  };

  const handleEditStep = (id: string, newText: string) => {
    setSteps(steps.map(step =>
      step.id === id ? { ...step, text: newText } : step
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddStep();
    }
  };

  const handleStart = () => {
    // If there's text in the new step input, add it before starting
    if (newStepText.trim() && steps.length < MAX_STEPS) {
      const newStep = createPrepStep(newStepText);
      const updatedSteps = [...steps, newStep];
      // Save the draft with the final step included
      saveDraft({ intent, steps: updatedSteps });
    }
    onStart();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn"
      >
        {/* Header with gentle prompt */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            Let's focus
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Taking a moment to set your intention helps anchor your focus
          </p>
        </div>

        {/* Intent Input - Emphasized as the main focus */}
        <div className="mb-8">
          <label htmlFor="intent" className="block text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">
            I'm focusing on...
          </label>
          <textarea
            id="intent"
            value={intent}
            onChange={(e) => setIntent(e.target.value.slice(0, MAX_INTENT_LENGTH))}
            placeholder="What matters most right now?"
            maxLength={MAX_INTENT_LENGTH}
            rows={2}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700/50 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 dark:focus:border-cyan-500 focus:bg-white dark:focus:bg-slate-700 transition-all resize-none text-base"
          />
          {intent.length > 60 && (
            <div className="text-xs text-slate-400 mt-1.5 text-right">
              {MAX_INTENT_LENGTH - intent.length} characters remaining
            </div>
          )}
        </div>

        {/* Focus Steps - Simplified, checkbox-style */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Steps to work through
            </label>
            {steps.length > 0 && (
              <span className="text-xs text-slate-400">
                {steps.length} of {MAX_STEPS}
              </span>
            )}
          </div>

          {/* Existing Steps - Minimal, calm design */}
          {steps.length > 0 && (
            <div className="space-y-2 mb-3">
              {steps.map((step) => (
                <div
                  key={step.id}
                  className="flex items-start gap-3 group bg-slate-50 dark:bg-slate-700/30 rounded-lg px-3 py-2.5 transition-all hover:bg-slate-100 dark:hover:bg-slate-700/50"
                >
                  <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-500 bg-white dark:bg-slate-700 mt-0.5"></div>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleEditStep(step.id, e.target.value.slice(0, MAX_STEP_LENGTH))}
                    maxLength={MAX_STEP_LENGTH}
                    className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400"
                    placeholder="Step description..."
                  />
                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="flex-shrink-0 p-1 rounded text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Remove step"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Step - Simplified */}
          {steps.length < MAX_STEPS && (
            <div
              onClick={() => {
                // Focus the input when clicking the wrapper
                document.getElementById('new-step-input')?.focus();
              }}
              className="w-full flex items-start gap-3 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-lg px-3 py-2.5 transition-all border-2 border-dashed border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 group cursor-text"
            >
              <div className="flex-shrink-0 w-5 h-5 rounded border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 mt-0.5 group-hover:border-cyan-400 dark:group-hover:border-cyan-500 transition-colors"></div>
              <input
                id="new-step-input"
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value.slice(0, MAX_STEP_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder={steps.length === 0 ? "Add a step to work on (optional)..." : "Add another step..."}
                maxLength={MAX_STEP_LENGTH}
                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400 text-left"
              />
            </div>
          )}

          {steps.length === 0 && (
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 px-3">
              Small steps help reduce overwhelm
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <button
            onClick={onSkipSetup}
            className="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-all duration-200 font-medium"
          >
            Skip for now
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02]"
          >
            {intent ? "Start focused session" : "Start session"}
          </button>
        </div>
      </div>
    </div>
  );
};

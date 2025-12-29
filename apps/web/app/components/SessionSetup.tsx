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
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
          Session Setup
        </h2>

        {/* Intent Input */}
        <div className="mb-6">
          <label htmlFor="intent" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            What are you focusing on? <span className="text-slate-400">(optional)</span>
          </label>
          <input
            id="intent"
            type="text"
            value={intent}
            onChange={(e) => setIntent(e.target.value.slice(0, MAX_INTENT_LENGTH))}
            placeholder="e.g., Write blog post about TypeScript"
            maxLength={MAX_INTENT_LENGTH}
            className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all"
          />
          <div className="text-xs text-slate-400 mt-1 text-right">
            {intent.length}/{MAX_INTENT_LENGTH}
          </div>
        </div>

        {/* Prep Steps */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Prep steps <span className="text-slate-400">(optional, max {MAX_STEPS})</span>
          </label>

          {/* Existing Steps */}
          {steps.length > 0 && (
            <div className="space-y-2 mb-3">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className="flex items-center gap-2 group"
                >
                  <span className="text-xs text-slate-400 w-5">{index + 1}.</span>
                  <input
                    type="text"
                    value={step.text}
                    onChange={(e) => handleEditStep(step.id, e.target.value.slice(0, MAX_STEP_LENGTH))}
                    maxLength={MAX_STEP_LENGTH}
                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all"
                  />
                  <button
                    onClick={() => handleRemoveStep(step.id)}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Step */}
          {steps.length < MAX_STEPS && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-5">{steps.length + 1}.</span>
              <input
                type="text"
                value={newStepText}
                onChange={(e) => setNewStepText(e.target.value.slice(0, MAX_STEP_LENGTH))}
                onKeyDown={handleKeyDown}
                placeholder="Add a prep step..."
                maxLength={MAX_STEP_LENGTH}
                className="flex-1 px-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:focus:ring-cyan-400 transition-all"
              />
              <button
                onClick={handleAddStep}
                disabled={!newStepText.trim()}
                className="p-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-8">
          <button
            onClick={onSkipSetup}
            className="flex-1 px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 font-medium"
          >
            Skip setup
          </button>
          <button
            onClick={handleStart}
            className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Start session
          </button>
        </div>
      </div>
    </div>
  );
};

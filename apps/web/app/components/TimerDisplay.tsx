"use client";

import { useState } from "react";
import { TimerBlock, TimerMode, SessionDraft } from "../types";
import { ProgressBar } from "./ProgressBar";
import { TomatoIcon } from "./TomatoIcon";
import { FlowmatoAnimated } from "./FlowmatoAnimated";

const MAX_STEP_LENGTH = 60;

interface TimerDisplayProps {
  sessions: TimerBlock[];
  currentSessionIndex: number;
  timerMode: TimerMode;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  adjustTime: (seconds: number) => void;
  isPaused: boolean;
  togglePause: () => void;
  addMoreCycles: (count: number) => void;
  removeCycles: (count: number) => void;
  skipToNext: () => void;
  onFinishSession: () => void;
  muteAll: boolean;
  setMuteAll: (mute: boolean) => void;
  muteBreak: boolean;
  setMuteBreak: (mute: boolean) => void;
  isPiPSupported: boolean;
  openPiP: () => void;
  sessionDraft?: SessionDraft;
  onUpdateIntent?: (intent: string) => void;
  onToggleStep?: (stepId: string) => void;
  onAddStep?: (text: string) => void;
  onEditStep?: (stepId: string, newText: string) => void;
  onRemoveStep?: (stepId: string) => void;
  onReorderStep?: (fromId: string, toId: string) => void;
}

export const TimerDisplay = ({
  sessions,
  currentSessionIndex,
  timerMode,
  timeRemaining,
  formatTime,
  adjustTime,
  isPaused,
  togglePause,
  addMoreCycles,
  removeCycles,
  skipToNext,
  onFinishSession,
  muteAll,
  setMuteAll,
  muteBreak,
  setMuteBreak,
  isPiPSupported,
  openPiP,
  sessionDraft,
  onUpdateIntent,
  onToggleStep,
  onAddStep,
  onEditStep,
  onRemoveStep,
  onReorderStep,
}: TimerDisplayProps) => {
  const [isEditingIntent, setIsEditingIntent] = useState(false);
  const [editedIntent, setEditedIntent] = useState("");
  const [stepsExpanded, setStepsExpanded] = useState(true);
  const [editingStepId, setEditingStepId] = useState<string | null>(null);
  const [editingStepText, setEditingStepText] = useState("");
  const [isAddingStep, setIsAddingStep] = useState(false);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [newStepText, setNewStepText] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  const canRemoveCycle = sessions.length - currentSessionIndex > 2;
  const currentSessionType = sessions[currentSessionIndex]?.type;

  const getFlowmatoSrc = () => {
    if (currentSessionType === 'break') return '/flowmato/state/flowmato_relaxing.png';
    if (isPaused) return '/flowmato/state/flowmato_daydreaming.png';
    const total = sessions[currentSessionIndex]?.duration ?? 1;
    const pct = (total - timeRemaining) / total;
    if (pct < 0.20) return '/flowmato/progress/1_seedling.png';
    if (pct < 0.40) return '/flowmato/progress/2_plant.png';
    if (pct < 0.60) return '/flowmato/progress/3_small.png';
    if (pct < 0.80) return '/flowmato/progress/4_medium.png';
    if (pct < 1.00) return '/flowmato/progress/5_full.png';
    return '/flowmato/progress/6_happy.png'; // only at 100%
  };

  const getFlowmatoLabel = () => {
    if (currentSessionType === 'break') return 'Flowmato is resting...';
    if (isPaused) return 'Flowmato is daydreaming...';
    return 'Flowmato is growing!';
  };

  const handleStartEditIntent = () => {
    setEditedIntent(sessionDraft?.intent || "");
    setIsEditingIntent(true);
  };

  const handleSaveIntent = () => {
    if (onUpdateIntent) {
      onUpdateIntent(editedIntent);
    }
    setIsEditingIntent(false);
  };

  const handleCancelEdit = () => {
    setIsEditingIntent(false);
  };

  const handleStartEditStep = (id: string, text: string) => {
    setEditingStepId(id);
    setEditingStepText(text);
  };

  const handleSaveEditStep = () => {
    if (editingStepId && editingStepText.trim()) {
      onEditStep?.(editingStepId, editingStepText.trim());
    }
    setEditingStepId(null);
    setEditingStepText("");
  };

  const handleCancelEditStep = () => {
    setEditingStepId(null);
    setEditingStepText("");
  };

  const handleRemoveStep = (stepId: string) => {
    if (editingStepId === stepId) {
      setEditingStepId(null);
      setEditingStepText("");
    }
    onRemoveStep?.(stepId);
  };

  const handleSubmitNewStep = () => {
    if (newStepText.trim()) {
      onAddStep?.(newStepText.trim());
    }
    setNewStepText("");
    setIsAddingStep(false);
  };

  const btnSecondary = "bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs";

  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/20 dark:border-cyan-500/20 overflow-hidden">

      {/* Progress bar — top of card */}
      <div className="px-6 pt-4">
        <ProgressBar
          sessions={sessions}
          currentSessionIndex={currentSessionIndex}
          timeRemaining={timeRemaining}
        />
      </div>

      <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-4">

        {/* Session label row */}
        <div className="text-center mb-3">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <span>
              {currentSessionType === "focus" && (timerMode === "custom" ? "⏱️ Custom Timer" : "🎯 Focus")}
              {currentSessionType === "break" && "☕ Break"}
            </span>
            {sessions.length > 1 && (
              <>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span>Session {currentSessionIndex + 1}/{sessions.length}</span>
              </>
            )}
          </div>

          {/* Intent — focus sessions only */}
          {currentSessionType === "focus" && sessionDraft && (
            <div className="mt-1.5">
              {isEditingIntent ? (
                <div className="flex items-center gap-2 max-w-xs mx-auto">
                  <input
                    type="text"
                    value={editedIntent}
                    onChange={(e) => setEditedIntent(e.target.value.slice(0, 80))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveIntent();
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                  <button
                    onClick={handleSaveIntent}
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white transition-all"
                    aria-label="Save"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-600 dark:text-white transition-all"
                    aria-label="Cancel"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : sessionDraft.intent ? (
                <div className="group cursor-pointer inline-flex items-center gap-1.5" onClick={handleStartEditIntent}>
                  <span className="text-sm text-slate-500 dark:text-slate-400">{sessionDraft.intent}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleStartEditIntent(); }}
                    className="text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100"
                    aria-label="Edit focus"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleStartEditIntent}
                  className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 transition-all"
                >
                  + what are you focusing on?
                </button>
              )}
            </div>
          )}
        </div>

        {/* Flowmato */}
        <div className="flex justify-center mb-2">
          <FlowmatoAnimated
            key={currentSessionIndex}
            src={getFlowmatoSrc()}
            label={getFlowmatoLabel()}
            isPaused={isPaused}
            currentSessionType={currentSessionType}
          />
        </div>

        {/* Timer number */}
        <div className={`text-center text-7xl sm:text-8xl font-bold font-mono mb-5 transition-all duration-300 ${
          currentSessionType === "focus"
            ? "text-slate-800 dark:text-white dark:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            : "text-[#2FC6A5] dark:text-[#2FC6A5] drop-shadow-[0_0_30px_rgba(47,198,165,0.5)]"
        }`}>
          {formatTime(timeRemaining)}
        </div>

        {/* Primary controls: −1m · pause · +1m */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <button
            onClick={() => adjustTime(-60)}
            className={btnSecondary}
            title="Subtract 1 minute"
            aria-label="Subtract 1 minute"
          >
            −1m
          </button>

          <button
            onClick={togglePause}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold px-8 py-3.5 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2.5"
            aria-label={isPaused ? "Resume timer" : "Pause timer"}
          >
            {isPaused ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold">Resume</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold">Pause</span>
              </>
            )}
          </button>

          <button
            onClick={() => adjustTime(60)}
            className={btnSecondary}
            title="Add 1 minute"
            aria-label="Add 1 minute"
          >
            +1m
          </button>
        </div>

        {/* Secondary row: mute · skip · finish */}
        <div className="flex items-center justify-center gap-3 mb-3">
          {/* Mute all — always visible */}
          <button
            onClick={() => {
              setMuteAll(!muteAll);
              if (!muteAll && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border ${
              muteAll
                ? "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"
                : "bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
            }`}
            title={muteAll ? "Unmute sounds" : "Mute all sounds"}
            aria-label={muteAll ? "Unmute all sounds" : "Mute all sounds"}
          >
            {muteAll ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>

          <span className="text-slate-200 dark:text-slate-700">|</span>

          <button
            onClick={skipToNext}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title={currentSessionIndex >= sessions.length - 1 ? "End block and finish" : "Skip to next session"}
          >
            skip
          </button>

          <span className="text-slate-300 dark:text-slate-600">·</span>

          <button
            onClick={onFinishSession}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            title="End session and save your focus time"
          >
            finish session
          </button>
        </div>

        {/* More options toggle */}
        <div className="text-center">
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 transition-colors inline-flex items-center gap-1"
          >
            <span>···</span>
            <span>{moreOpen ? "less" : "more options"}</span>
          </button>
        </div>

        {/* Collapsible secondary controls */}
        {moreOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap gap-2 justify-center">
            {/* ±5m */}
            <button onClick={() => adjustTime(-60 * 5)} className={btnSecondary} title="Subtract 5 minutes">−5m</button>
            <button onClick={() => adjustTime(60 * 5)} className={btnSecondary} title="Add 5 minutes">+5m</button>

            {/* Mute break */}
            <button
              onClick={() => {
                setMuteBreak(!muteBreak);
                if (!muteBreak && 'speechSynthesis' in window) window.speechSynthesis.cancel();
              }}
              className={`p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border text-xs flex items-center gap-1.5 ${
                muteBreak
                  ? "bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400 border-red-200 dark:border-red-800"
                  : "bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600"
              }`}
              title={muteBreak ? "Unmute during breaks" : "Mute during breaks"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              <span>{muteBreak ? "break muted" : "mute break"}</span>
            </button>

            {/* PiP */}
            {isPiPSupported && (
              <button
                onClick={openPiP}
                className="p-2 rounded-xl bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                title="Picture-in-Picture"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            )}

            {/* Add/Remove cycles — Pomodoro only */}
            {timerMode === "pomodoro" && (
              <>
                <button
                  onClick={() => removeCycles(1)}
                  disabled={!canRemoveCycle}
                  className={`flex items-center gap-1 font-medium py-1.5 px-3 rounded-xl transition-all duration-200 backdrop-blur-sm border text-xs ${
                    canRemoveCycle
                      ? "bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 cursor-pointer"
                      : "bg-slate-200/40 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-300/40 dark:border-slate-700/40 cursor-not-allowed"
                  }`}
                  title={canRemoveCycle ? "Remove one Pomodoro" : "Cannot remove current or past cycles"}
                >
                  <TomatoIcon className="w-3.5 h-3.5" />
                  <span>−</span>
                </button>
                <button
                  onClick={() => addMoreCycles(1)}
                  className="flex items-center gap-1 bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-1.5 px-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
                  title="Add one Pomodoro"
                >
                  <TomatoIcon className="w-3.5 h-3.5" />
                  <span>+</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* Steps — collapsible, below all controls */}
        {currentSessionType === "focus" && sessionDraft && (
          <div className="mt-5 pt-4 border-t border-slate-200/70 dark:border-slate-700/70">
            {sessionDraft.steps.length > 0 ? (
              <>
                <button
                  onClick={() => setStepsExpanded(!stepsExpanded)}
                  className="w-full flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
                >
                  <span className="font-medium">
                    {sessionDraft.steps.filter(s => s.done).length} / {sessionDraft.steps.length} steps
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${stepsExpanded ? 'rotate-180' : ''}`}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>

                {stepsExpanded && (
                  <div className="mt-2 space-y-0.5 max-h-48 overflow-y-auto">
                    {[...sessionDraft.steps]
                      .sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1))
                      .map((step) => {
                        const originalIdx = sessionDraft.steps!.findIndex(s => s.id === step.id);
                        const isActive = !step.done && sessionDraft.steps!.slice(0, originalIdx).every(s => s.done);
                        const isEditing = editingStepId === step.id;
                        return (
                          <div
                            key={step.id}
                            draggable={!isEditing}
                            onDragStart={(e) => {
                              e.dataTransfer.setData('text/plain', step.id);
                              e.dataTransfer.effectAllowed = 'move';
                            }}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                              setDragOverId(step.id);
                            }}
                            onDragLeave={() => setDragOverId(null)}
                            onDrop={(e) => {
                              e.preventDefault();
                              const fromId = e.dataTransfer.getData('text/plain');
                              if (fromId && fromId !== step.id) onReorderStep?.(fromId, step.id);
                              setDragOverId(null);
                            }}
                            onDragEnd={() => setDragOverId(null)}
                            className={`group w-full flex items-center gap-2.5 text-left px-2 py-1.5 rounded-lg transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 ${step.done && !isEditing ? 'opacity-30' : ''} ${dragOverId === step.id ? 'ring-1 ring-cyan-400 dark:ring-cyan-500' : ''}`}
                          >
                            {!isEditing && (
                              <div className="flex-shrink-0 cursor-grab active:cursor-grabbing text-slate-200 dark:text-slate-700 group-hover:text-slate-400 dark:group-hover:text-slate-500 opacity-0 group-hover:opacity-100 select-none -ml-0.5">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 10 16" className="w-2.5 h-3.5">
                                  <circle cx="3" cy="3" r="1.3"/><circle cx="7" cy="3" r="1.3"/>
                                  <circle cx="3" cy="8" r="1.3"/><circle cx="7" cy="8" r="1.3"/>
                                  <circle cx="3" cy="13" r="1.3"/><circle cx="7" cy="13" r="1.3"/>
                                </svg>
                              </div>
                            )}
                            <button
                              onClick={() => onToggleStep?.(step.id)}
                              className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                                step.done
                                  ? 'border-green-500 bg-green-500 dark:border-green-400 dark:bg-green-400'
                                  : isActive
                                  ? 'border-cyan-500 dark:border-cyan-400'
                                  : 'border-slate-300 dark:border-slate-500'
                              }`}
                              aria-label={step.done ? "Mark as not done" : "Mark as done"}
                            >
                              {step.done && (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="white" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                              )}
                            </button>

                            {isEditing ? (
                              <input
                                type="text"
                                value={editingStepText}
                                onChange={(e) => setEditingStepText(e.target.value.slice(0, MAX_STEP_LENGTH))}
                                onBlur={handleSaveEditStep}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') { e.preventDefault(); handleSaveEditStep(); }
                                  if (e.key === 'Escape') { e.preventDefault(); handleCancelEditStep(); }
                                }}
                                autoFocus
                                className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-200 focus:outline-none border-b border-slate-300 dark:border-slate-500 pb-0.5"
                              />
                            ) : (
                              <span
                                onClick={() => handleStartEditStep(step.id, step.text)}
                                className={`flex-1 leading-snug text-sm cursor-text ${
                                  step.done
                                    ? 'line-through text-slate-400 dark:text-slate-500'
                                    : isActive
                                    ? 'font-semibold text-slate-700 dark:text-slate-100'
                                    : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {step.text}
                              </span>
                            )}

                            {!isEditing && (
                              <button
                                onClick={() => handleRemoveStep(step.id)}
                                className="flex-shrink-0 p-0.5 rounded text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 transition-all opacity-0 group-hover:opacity-100"
                                aria-label="Remove step"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        );
                      })}

                    {isAddingStep ? (
                        <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-600">
                          <div className="flex-shrink-0 w-4 h-4 rounded border-2 border-slate-200 dark:border-slate-600" />
                          <input
                            type="text"
                            value={newStepText}
                            onChange={(e) => setNewStepText(e.target.value.slice(0, MAX_STEP_LENGTH))}
                            onBlur={handleSubmitNewStep}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') { e.preventDefault(); handleSubmitNewStep(); }
                              if (e.key === 'Escape') { e.preventDefault(); setIsAddingStep(false); setNewStepText(""); }
                            }}
                            autoFocus
                            placeholder="Add a step..."
                            className="flex-1 bg-transparent text-sm text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400"
                          />
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsAddingStep(true)}
                          className="w-full text-left px-2 py-1.5 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 transition-all"
                        >
                          + add a step
                        </button>
                      )
                    }
                  </div>
                )}
              </>
            ) : (
              isAddingStep ? (
                <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg border border-dashed border-slate-200 dark:border-slate-600">
                  <div className="flex-shrink-0 w-3.5 h-3.5 rounded border-2 border-slate-200 dark:border-slate-600" />
                  <input
                    type="text"
                    value={newStepText}
                    onChange={(e) => setNewStepText(e.target.value.slice(0, MAX_STEP_LENGTH))}
                    onBlur={handleSubmitNewStep}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); handleSubmitNewStep(); }
                      if (e.key === 'Escape') { e.preventDefault(); setIsAddingStep(false); setNewStepText(""); }
                    }}
                    autoFocus
                    placeholder="Add a step..."
                    className="flex-1 bg-transparent text-xs text-slate-700 dark:text-slate-300 focus:outline-none placeholder-slate-400"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsAddingStep(true)}
                  className="text-sm text-slate-400 dark:text-slate-500 hover:text-slate-500 dark:hover:text-slate-400 transition-all"
                >
                  + add a step
                </button>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};

"use client";

import { PomodoroSession, TimerMode } from "../types";
import { ProgressBar } from "./ProgressBar";
import { TomatoIcon } from "./TomatoIcon";

interface TimerDisplayProps {
  sessions: PomodoroSession[];
  currentSessionIndex: number;
  timerMode: TimerMode;
  timeRemaining: number;
  formatTime: (seconds: number) => string;
  adjustTime: (seconds: number) => void;
  isPaused: boolean;
  togglePause: () => void;
  addMoreCycles: (count: number) => void;
  removeCycles: (count: number) => void;
  muteAll: boolean;
  setMuteAll: (mute: boolean) => void;
  muteBreak: boolean;
  setMuteBreak: (mute: boolean) => void;
  isPiPSupported: boolean;
  openPiP: () => void;
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
  muteAll,
  setMuteAll,
  muteBreak,
  setMuteBreak,
  isPiPSupported,
  openPiP,
}: TimerDisplayProps) => {
  // Calculate if we can remove cycles
  // We can remove if there are at least 2 sessions after the current session
  const canRemoveCycle = sessions.length - currentSessionIndex > 2;
  const currentSessionType = sessions[currentSessionIndex]?.type;
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-cyan-500/20">
      {/* Current session info */}
      <div className="text-center mb-8">
        <div className={`inline-block px-8 py-3 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
          currentSessionType === "focus"
            ? "bg-blue-500 dark:bg-cyan-500 dark:shadow-cyan-500/50"
            : "bg-slate-500 dark:bg-slate-600"
        }`}>
          {currentSessionType === "focus" && (timerMode === "custom" ? "⏱️ Custom Timer" : "🎯 Focus Time")}
          {currentSessionType === "break" && "☕ Break Time"}
        </div>

        {sessions.length > 1 && (
          <div className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium">
            Session {currentSessionIndex + 1} of {sessions.length}
          </div>
        )}
      </div>

      {/* Timer display */}
      <div className="text-center mb-6 sm:mb-8">
        <div className={`text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold mb-3 sm:mb-4 font-mono transition-all duration-300 ${
          currentSessionType === "focus"
            ? "text-slate-800 dark:text-white dark:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
            : "text-[#2FC6A5] dark:text-[#2FC6A5] drop-shadow-[0_0_30px_rgba(47,198,165,0.5)]"
        }`}>
          {formatTime(timeRemaining)}
        </div>

        {/* Time adjustment controls - below timer */}
        <div className="flex gap-2 justify-center mb-4">
          <button
            onClick={() => adjustTime(-60 * 5)}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
            title="Subtract 5 minutes"
            aria-label="Subtract 5 minutes"
          >
            -5m
          </button>
          <button
            onClick={() => adjustTime(-60)}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
            title="Subtract 1 minute"
            aria-label="Subtract 1 minute"
          >
            -1m
          </button>
          <button
            onClick={() => adjustTime(60)}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
            title="Add 1 minute"
            aria-label="Add 1 minute"
          >
            +1m
          </button>
          <button
            onClick={() => adjustTime(60 * 5)}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
            title="Add 5 minutes"
            aria-label="Add 5 minutes"
          >
            +5m
          </button>
        </div>

        {/* Segmented Progress bar */}
        <ProgressBar
          sessions={sessions}
          currentSessionIndex={currentSessionIndex}
          timeRemaining={timeRemaining}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5 items-center">
        {/* Primary Controls - Pause Button */}
        <div className="flex gap-3 justify-center">
          <button
            onClick={togglePause}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
            aria-label={isPaused ? "Resume timer" : "Pause timer"}
            title={isPaused ? "Resume Timer" : "Pause Timer"}
          >
            {isPaused ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Secondary Controls Row */}
        <div className="flex flex-wrap gap-2 items-center justify-center text-sm">
          {/* Add/Remove cycles - Pomodoro only */}
          {timerMode === "pomodoro" && (
            <>
              <button
                onClick={() => removeCycles(1)}
                disabled={!canRemoveCycle}
                className={`flex items-center gap-1 font-medium py-2 px-3 rounded-xl transition-all duration-200 backdrop-blur-sm border ${
                  canRemoveCycle
                    ? "bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-600 cursor-pointer"
                    : "bg-slate-200/40 dark:bg-slate-800/40 text-slate-400 dark:text-slate-600 border-slate-300/40 dark:border-slate-700/40 cursor-not-allowed"
                }`}
                title={canRemoveCycle ? "Remove one Pomodoro" : "Cannot remove current or past cycles"}
                aria-label="Remove one Pomodoro"
              >
                <TomatoIcon className="w-4 h-4" />
                <span>−</span>
              </button>
              <button
                onClick={() => addMoreCycles(1)}
                className="flex items-center gap-1 bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                title="Add one Pomodoro"
                aria-label="Add one Pomodoro"
              >
                <TomatoIcon className="w-4 h-4" />
                <span>+</span>
              </button>
            </>
          )}

          {/* Mute all button - Icon only */}
          <button
            onClick={() => {
              setMuteAll(!muteAll);
              if (!muteAll && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
            title={muteAll ? "Unmute All Sounds" : "Mute All Sounds"}
            aria-label={muteAll ? "Unmute all sounds" : "Mute all sounds"}
          >
            {muteAll ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
              </svg>
            )}
          </button>

          {/* Mute breaks button - Icon only */}
          <button
            onClick={() => {
              setMuteBreak(!muteBreak);
              if (!muteBreak && 'speechSynthesis' in window) {
                window.speechSynthesis.cancel();
              }
            }}
            className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
            title={muteBreak ? "Unmute During Breaks" : "Mute During Breaks"}
            aria-label={muteBreak ? "Unmute during breaks" : "Mute during breaks"}
          >
            {muteBreak ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            )}
          </button>

          {/* PiP button - only show if supported */}
          {isPiPSupported && (
            <button
              onClick={openPiP}
              className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
              title="Picture-in-Picture Mode"
              aria-label="Open picture-in-picture mode"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

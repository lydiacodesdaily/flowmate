import { TimerMode, SessionDuration, TimerType } from "../types";
import { TomatoIcon } from "./TomatoIcon";

interface TimerSelectionProps {
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
  timerType: TimerType;
  setTimerType: (type: TimerType) => void;
  guidedStyle: "pomodoro" | "deep-focus";
  setGuidedStyle: (style: "pomodoro" | "deep-focus") => void;
  customMinutes: string;
  setCustomMinutes: (minutes: string) => void;
  startSession: (duration: SessionDuration) => void;
  startCustomSession: (minutes: number) => void;
}

export const TimerSelection = ({
  timerMode,
  setTimerMode,
  timerType,
  setTimerType,
  guidedStyle,
  setGuidedStyle,
  customMinutes,
  setCustomMinutes,
  startSession,
  startCustomSession,
}: TimerSelectionProps) => {
  return (
    <div>
      {/* Tab Navigation */}
      <div className="flex justify-center mb-5">
        <div className="inline-flex rounded-2xl border border-white/50 dark:border-white/15 p-1 bg-white/30 dark:bg-white/5 backdrop-blur-md">
          <button
            onClick={() => setTimerMode("pomodoro")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
              timerMode === "pomodoro"
                ? "bg-white dark:bg-white/20 text-blue-700 dark:text-cyan-300 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setTimerMode("guided")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
              timerMode === "guided"
                ? "bg-white dark:bg-white/20 text-blue-700 dark:text-cyan-300 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            }`}
          >
            Guided
          </button>
          <button
            onClick={() => setTimerMode("custom")}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl transition-all duration-200 text-xs sm:text-sm whitespace-nowrap ${
              timerMode === "custom"
                ? "bg-white dark:bg-white/20 text-blue-700 dark:text-cyan-300 shadow-md font-bold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      {/* Timer Type Toggle - Focus vs Break (Custom Mode Only) */}
      {timerMode === "custom" && (
        <div className="flex justify-center mb-4">
          <div className="inline-flex gap-2">
            <button
              onClick={() => setTimerType("focus")}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                timerType === "focus"
                  ? "bg-blue-500 dark:bg-cyan-500 text-white"
                  : "bg-white/40 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/20"
              }`}
            >
              Focus
            </button>
            <button
              onClick={() => setTimerType("break")}
              className={`px-4 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 ${
                timerType === "break"
                  ? "bg-blue-500 dark:bg-cyan-500 text-white"
                  : "bg-white/40 dark:bg-white/10 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-white/20"
              }`}
            >
              Break
            </button>
          </div>
        </div>
      )}

      {/* Guided Style Toggle */}
      {timerMode === "guided" && (
        <div className="flex items-center justify-center gap-2 mb-4">
          <button
            onClick={() => setGuidedStyle(guidedStyle === "pomodoro" ? "deep-focus" : "pomodoro")}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/30 dark:bg-white/10 hover:bg-white/50 dark:hover:bg-white/20 transition-all duration-200 border border-white/40 dark:border-white/10"
          >
            <TomatoIcon className={`w-3.5 h-3.5 transition-opacity ${guidedStyle === "pomodoro" ? "opacity-100" : "opacity-30"}`} />
            <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
              {guidedStyle === "pomodoro" ? "Pomodoro Style" : "Deep Focus"}
            </span>
            <div className={`w-8 h-4 rounded-full transition-colors duration-200 relative ${
              guidedStyle === "pomodoro"
                ? "bg-blue-500 dark:bg-cyan-500"
                : "bg-slate-300 dark:bg-slate-600"
            }`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                guidedStyle === "pomodoro" ? "left-0.5" : "left-[18px]"
              }`} />
            </div>
          </button>
        </div>
      )}

      {timerMode === "custom" ? (
        <div className="space-y-4">
          {/* Custom time input */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-full max-w-sm">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
                Enter minutes
              </label>
              <input
                type="number"
                min="1"
                max="999"
                value={customMinutes}
                onChange={(e) => setCustomMinutes(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && customMinutes && parseInt(customMinutes) > 0) {
                    startCustomSession(parseInt(customMinutes));
                  }
                }}
                placeholder="e.g., 15, 45, 120"
                className="w-full px-6 py-3 text-2xl text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border border-white/50 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200 font-mono"
              />
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50/70 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Voice announcements begin at 25 minutes
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                if (customMinutes && parseInt(customMinutes) > 0) {
                  startCustomSession(parseInt(customMinutes));
                }
              }}
              disabled={!customMinutes || parseInt(customMinutes) <= 0}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-3 px-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Timer
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-2">Quick presets:</p>
            <div className="grid grid-cols-3 gap-2.5">
              {[5, 10, 50].map((preset) => (
                <button
                  key={preset}
                  onClick={() => startCustomSession(preset)}
                  className="bg-white/40 hover:bg-white/70 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-white/50 dark:border-white/10 hover:scale-105 text-sm"
                >
                  {preset} min
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {(timerMode === "pomodoro"
            ? [25, 55, 85, 145]
            : [30, 60, 90, 120, 180]
          ).map((duration, index) => {
            const pomodoroCount = timerMode === "pomodoro"
              ? Math.floor((duration + 5) / 30)
              : 0;

            const colors = timerMode === "pomodoro"
              ? [
                  "bg-blue-400/85 hover:bg-blue-500/90 dark:bg-cyan-400/80 dark:hover:bg-cyan-500/90",
                  "bg-blue-500/85 hover:bg-blue-600/90 dark:bg-cyan-500/80 dark:hover:bg-cyan-600/90",
                  "bg-blue-600/85 hover:bg-blue-700/90 dark:bg-cyan-600/80 dark:hover:bg-cyan-700/90",
                  "bg-blue-700/85 hover:bg-blue-800/90 dark:bg-cyan-700/80 dark:hover:bg-cyan-800/90"
                ]
              : [
                  "bg-blue-400/85 hover:bg-blue-500/90 dark:bg-cyan-400/80 dark:hover:bg-cyan-500/90",
                  "bg-blue-500/85 hover:bg-blue-600/90 dark:bg-cyan-500/80 dark:hover:bg-cyan-600/90",
                  "bg-blue-600/85 hover:bg-blue-700/90 dark:bg-cyan-600/80 dark:hover:bg-cyan-700/90",
                  "bg-blue-700/85 hover:bg-blue-800/90 dark:bg-cyan-700/80 dark:hover:bg-cyan-800/90",
                  "bg-blue-800/85 hover:bg-blue-900/90 dark:bg-cyan-800/80 dark:hover:bg-cyan-900/90"
                ];

            const taglines = timerMode === "pomodoro"
              ? [
                  "Classic focus session",
                  "Two rounds back-to-back",
                  "Deep flow block",
                  "Extended deep work"
                ]
              : guidedStyle === "pomodoro"
              ? [
                  "Quick guided session",
                  "Standard deep work",
                  "Extended focus time",
                  "Long work session",
                  "Marathon focus"
                ]
              : [
                  "Quick session",
                  "50 min uninterrupted",
                  "80 min deep focus",
                  "Two deep blocks",
                  "Three deep blocks"
                ];

            return (
              <button
                key={duration}
                onClick={() => startSession(duration as SessionDuration)}
                className={`${colors[index]} backdrop-blur-sm text-white font-bold py-3 sm:py-5 px-4 sm:px-6 rounded-xl sm:rounded-2xl transition-all duration-200 transform hover:scale-[1.03] hover:shadow-2xl border border-white/20`}
                style={{ boxShadow: '0px 6px 20px rgba(0,0,0,0.12)' }}
              >
                {timerMode === "pomodoro" && (
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-1.5">
                    {Array.from({ length: pomodoroCount }).map((_, i) => (
                      <TomatoIcon key={i} className="drop-shadow-sm w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ))}
                  </div>
                )}
                <div className="text-xl sm:text-2xl md:text-3xl mb-0.5 sm:mb-1">{duration} min</div>
                <div className="text-[9px] sm:text-[10px] opacity-75">
                  {taglines[index]}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

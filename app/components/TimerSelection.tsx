import { TimerMode, SessionDuration } from "../types";
import { TomatoIcon } from "./TomatoIcon";

interface TimerSelectionProps {
  timerMode: TimerMode;
  setTimerMode: (mode: TimerMode) => void;
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
  guidedStyle,
  setGuidedStyle,
  customMinutes,
  setCustomMinutes,
  startSession,
  startCustomSession,
}: TimerSelectionProps) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl pt-6 sm:pt-10 px-4 sm:px-10 pb-6 sm:pb-8 border border-white/20 dark:border-cyan-500/20">
      {/* Tab Navigation */}
      <div className="flex justify-center mb-6 sm:mb-8">
        <div className="inline-flex rounded-xl sm:rounded-2xl border-2 border-slate-300 dark:border-cyan-500/40 p-1 sm:p-1.5 bg-slate-100 dark:bg-slate-900/70 backdrop-blur-sm overflow-x-auto">
          <button
            onClick={() => setTimerMode("pomodoro")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
              timerMode === "pomodoro"
                ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            }`}
          >
            Pomodoro
          </button>
          <button
            onClick={() => setTimerMode("guided")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
              timerMode === "guided"
                ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            }`}
          >
            Guided
          </button>
          <button
            onClick={() => setTimerMode("custom")}
            className={`px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
              timerMode === "custom"
                ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
            }`}
          >
            Custom
          </button>
        </div>
      </div>

      <div className="mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold text-center text-slate-800 dark:text-white">
          {timerMode === "custom" ? "Custom Timer" : "Select Session Duration"}
        </h2>

        {/* Guided Style Toggle - inline with subtle design */}
        {timerMode === "guided" && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={() => setGuidedStyle(guidedStyle === "pomodoro" ? "deep-focus" : "pomodoro")}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 border border-slate-200 dark:border-slate-600"
            >
              <TomatoIcon className={`w-4 h-4 transition-opacity ${guidedStyle === "pomodoro" ? "opacity-100" : "opacity-30"}`} />
              <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                {guidedStyle === "pomodoro" ? "Pomodoro Style" : "Deep Focus"}
              </span>
              <div className={`w-9 h-5 rounded-full transition-colors duration-200 relative ${
                guidedStyle === "pomodoro"
                  ? "bg-blue-500 dark:bg-cyan-500"
                  : "bg-slate-300 dark:bg-slate-600"
              }`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${
                  guidedStyle === "pomodoro" ? "left-0.5" : "left-4"
                }`} />
              </div>
            </button>
          </div>
        )}
      </div>

      {timerMode === "custom" ? (
        <div className="space-y-6">
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
                className="w-full px-6 py-4 text-2xl text-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200 font-mono"
              />
              <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0">
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
              className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 dark:disabled:hover:bg-cyan-500"
            >
              Start Timer
            </button>
          </div>

          {/* Quick presets */}
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-3">Quick presets:</p>
            <div className="grid grid-cols-3 gap-3">
              {[15, 30, 45].map((preset) => (
                <button
                  key={preset}
                  onClick={() => startCustomSession(preset)}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 hover:scale-105"
                >
                  {preset} min
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {(timerMode === "pomodoro"
            ? [25, 55, 85, 145]
            : [30, 60, 90, 120, 180]
          ).map((duration, index) => {
            // Calculate pomodoro count for display
            const pomodoroCount = timerMode === "pomodoro"
              ? Math.floor((duration + 5) / 30)
              : 0;

            // Color progression for visual distinction
            const colors = timerMode === "pomodoro"
              ? [
                  "bg-blue-400 hover:bg-blue-500 dark:bg-cyan-400 dark:hover:bg-cyan-500",
                  "bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700",
                  "bg-blue-700 hover:bg-blue-800 dark:bg-cyan-700 dark:hover:bg-cyan-800"
                ]
              : [
                  "bg-blue-400 hover:bg-blue-500 dark:bg-cyan-400 dark:hover:bg-cyan-500",
                  "bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600",
                  "bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700",
                  "bg-blue-700 hover:bg-blue-800 dark:bg-cyan-700 dark:hover:bg-cyan-800",
                  "bg-blue-800 hover:bg-blue-900 dark:bg-cyan-800 dark:hover:bg-cyan-900"
                ];

            // Taglines for context
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
                className={`${colors[index]} text-white font-bold py-4 sm:py-6 px-4 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl`}
                style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
              >
                {timerMode === "pomodoro" && (
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1 sm:mb-2 mt-0.5 sm:mt-1">
                    {Array.from({ length: pomodoroCount }).map((_, i) => (
                      <TomatoIcon key={i} className="drop-shadow-sm w-4 h-4 sm:w-5 sm:h-5" />
                    ))}
                  </div>
                )}
                <div className="text-2xl sm:text-3xl md:text-4xl mb-1 sm:mb-2">{duration} min</div>
                <div className="text-[10px] sm:text-xs opacity-75 mt-0.5 sm:mt-1">
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

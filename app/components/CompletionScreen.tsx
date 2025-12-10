import { TimerMode } from "../types";

interface CompletionScreenProps {
  timerMode: TimerMode;
  selectedDuration: number;
  reset: () => void;
}

export const CompletionScreen = ({
  timerMode,
  selectedDuration,
  reset,
}: CompletionScreenProps) => {
  return (
    <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-cyan-500/20">
      <div className="text-center">
        {/* Celebration Icon */}
        <div className="text-8xl mb-6 animate-bounce">
          🎉
        </div>

        {/* Completion Message */}
        <h2 className="text-4xl font-bold text-slate-800 dark:text-white mb-3">
          Great Work!
        </h2>
        <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
          You completed your {selectedDuration} minute {timerMode === "custom" ? "custom" : timerMode} session
        </p>

        {/* Stats or Encouragement */}
        <div className="bg-blue-50 dark:bg-cyan-900/20 rounded-2xl p-6 mb-8 border border-blue-200 dark:border-cyan-700">
          <p className="text-slate-700 dark:text-slate-300 text-lg">
            {timerMode === "pomodoro" && "🍅 Another Pomodoro in the books!"}
            {timerMode === "guided" && "✨ Deep work session complete!"}
            {timerMode === "custom" && "⚡ Focused time well spent!"}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Start Another Session
          </button>
        </div>
      </div>
    </div>
  );
};

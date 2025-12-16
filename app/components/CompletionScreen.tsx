import { TimerMode, UserStats } from "../types";
import { StatsDisplay } from "./StatsDisplay";

interface CompletionScreenProps {
  timerMode: TimerMode;
  selectedDuration: number;
  reset: () => void;
  userStats: UserStats | null;
}

export const CompletionScreen = ({
  timerMode,
  selectedDuration,
  reset,
  userStats,
}: CompletionScreenProps) => {
  return (
    <div className="space-y-6">
      {/* Completion Card */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl p-6 sm:p-10 border border-white/20 dark:border-cyan-500/20">
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 animate-bounce">
            🎉
          </div>

          {/* Completion Message */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-800 dark:text-white mb-2 sm:mb-3">
            Great Work!
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 mb-6 sm:mb-8 px-2">
            {timerMode === "pomodoro" && `${selectedDuration} minutes complete.`}
            {timerMode === "guided" && "Session complete."}
            {timerMode === "custom" && "Timer complete."}
          </p>

          {/* Stats or Encouragement */}
          <div className="bg-blue-50 dark:bg-cyan-900/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 border border-blue-200 dark:border-cyan-700">
            <p className="text-slate-700 dark:text-slate-300 text-base sm:text-lg">
              {timerMode === "pomodoro" && "🍅 One pomodoro down."}
              {timerMode === "guided" && "✅ Nice flow."}
              {timerMode === "custom" && "✅ You're done."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button
              onClick={reset}
              className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl sm:rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl text-sm sm:text-base"
            >
              Choose Next Session
            </button>
          </div>
        </div>
      </div>

      {/* Stats Display */}
      {userStats && <StatsDisplay stats={userStats} />}
    </div>
  );
};

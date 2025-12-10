import { PomodoroSession } from "../types";

interface ProgressBarProps {
  sessions: PomodoroSession[];
  currentSessionIndex: number;
  timeRemaining: number;
}

export const ProgressBar = ({
  sessions,
  currentSessionIndex,
  timeRemaining,
}: ProgressBarProps) => {
  return (
    <div className="w-full flex gap-1 mb-4 py-2">
      {sessions.map((session, index) => {
        const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
        const sessionPercentage = (session.duration / totalDuration) * 100;

        // Calculate fill percentage for this segment
        let fillPercentage = 0;
        if (index < currentSessionIndex) {
          // Completed sessions are 100% filled
          fillPercentage = 100;
        } else if (index === currentSessionIndex) {
          // Current session shows progress
          const sessionProgress = ((session.duration - timeRemaining) / session.duration) * 100;
          fillPercentage = Math.max(0, Math.min(100, sessionProgress));
        }
        // Future sessions remain at 0%

        const isFocus = session.type === "focus";
        const isFirstSegment = index === 0;
        const isLastSegment = index === sessions.length - 1;

        // Determine border radius classes
        let borderRadiusClass = '';
        if (isFirstSegment && isLastSegment) {
          borderRadiusClass = 'rounded-full';
        } else if (isFirstSegment) {
          borderRadiusClass = 'rounded-l-full';
        } else if (isLastSegment) {
          borderRadiusClass = 'rounded-r-full';
        }

        // Format duration for tooltip
        const durationMinutes = Math.floor(session.duration / 60);
        const tooltipText = `${durationMinutes}m ${isFocus ? 'Focus' : 'Break'}`;

        return (
          <div
            key={index}
            style={{ flex: `${sessionPercentage} 1 0%` }}
            className={`relative h-4 overflow-hidden ${borderRadiusClass} cursor-pointer`}
            title={tooltipText}
          >
            {/* Background (unfilled) */}
            <div className={`absolute inset-0 pointer-events-none ${
              isFocus
                ? 'bg-[rgb(210,221,236)] dark:bg-slate-700/50'
                : 'bg-[rgb(81,94,168)] dark:bg-slate-600/50'
            }`}></div>

            {/* Progress fill */}
            <div
              className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
                isFocus
                  ? 'bg-[rgb(165,243,227)] dark:bg-cyan-400'
                  : 'bg-[rgb(115,122,201)] dark:bg-slate-500'
              }`}
              style={{ width: `${fillPercentage}%` }}
            ></div>
          </div>
        );
      })}
    </div>
  );
};

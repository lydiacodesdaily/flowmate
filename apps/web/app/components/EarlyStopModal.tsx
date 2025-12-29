"use client";

interface EarlyStopModalProps {
  elapsedMinutes: number;
  onSave: () => void;
  onResume: () => void;
  onDiscard: () => void;
}

export const EarlyStopModal = ({
  elapsedMinutes,
  onSave,
  onResume,
  onDiscard,
}: EarlyStopModalProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 text-center">
          Session paused
        </h2>

        <p className="text-slate-600 dark:text-slate-300 mb-2 text-center">
          You focused for <span className="font-semibold text-cyan-600 dark:text-cyan-400">{elapsedMinutes} {elapsedMinutes === 1 ? 'minute' : 'minutes'}</span>.
        </p>
        <p className="text-slate-600 dark:text-slate-300 mb-8 text-center">
          What would you like to do?
        </p>

        <div className="space-y-3">
          <button
            onClick={onSave}
            className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Save {elapsedMinutes} {elapsedMinutes === 1 ? 'minute' : 'minutes'}
          </button>

          <button
            onClick={onResume}
            className="w-full px-6 py-3 rounded-xl border-2 border-cyan-500 dark:border-cyan-400 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 font-medium transition-all duration-200"
          >
            Resume session
          </button>

          <button
            onClick={onDiscard}
            className="w-full px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200"
          >
            Discard session
          </button>
        </div>
      </div>
    </div>
  );
};

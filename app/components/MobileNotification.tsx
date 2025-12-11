interface MobileNotificationProps {
  onDismiss: () => void;
}

export const MobileNotification = ({ onDismiss }: MobileNotificationProps) => {
  return (
    <div className="fixed top-16 left-2 right-2 sm:left-4 sm:right-4 z-50 max-w-2xl mx-auto">
      <div className="bg-blue-50 dark:bg-cyan-900/30 backdrop-blur-lg border-2 border-blue-200 dark:border-cyan-700 rounded-xl sm:rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-cyan-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-800 dark:text-cyan-300 mb-1">
              Mobile Mode
            </h3>
            <p className="text-xs text-blue-700 dark:text-cyan-200">
              Tick sounds are disabled on mobile for better performance. Voice announcements will still work!
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-blue-600 dark:text-cyan-400 hover:text-blue-800 dark:hover:text-cyan-200 transition-colors"
            aria-label="Dismiss notification"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

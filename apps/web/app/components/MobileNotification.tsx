export const MobileNotification = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-blue-500/90 dark:bg-cyan-600/90 backdrop-blur-sm border-b border-blue-600 dark:border-cyan-500 shadow-md">
        <div className="max-w-7xl mx-auto px-3 py-2">
          <div className="flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-white flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
            </svg>
            <p className="text-xs sm:text-sm text-white font-medium text-center">
              Mobile mode: Tick sounds disabled. Voice announcements active.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

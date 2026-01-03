"use client";

export const MobileLandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      <div className="w-full max-w-md">
        <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-slate-700">
          {/* Logo/Icon */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 dark:from-cyan-500 dark:to-blue-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-10 h-10">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              Flowmate
            </h1>
            <p className="text-slate-600 dark:text-cyan-200/80 text-sm">
              Focus Timer with Audio Announcements
            </p>
          </div>

          {/* Main Message */}
          <div className="mb-8">
            <div className="bg-blue-50 dark:bg-slate-900/50 rounded-2xl p-6 mb-4 border border-blue-200 dark:border-cyan-500/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-500 dark:bg-cyan-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Desktop Only
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    For the best experience with audio announcements and timer features, please use Flowmate on a desktop browser.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-500/30">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="white" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-semibold text-slate-800 dark:text-white mb-1">
                    Mobile Apps Coming Soon
                  </h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Native iOS and Android apps are in development and will be available soon!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-2 pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-cyan-200/60">
              Made by Liddy 🦥✨
            </div>
            <div className="flex items-center justify-center gap-4 text-xs">
              <a
                href="https://lydiastud.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Lydia Studio
              </a>
              <span className="text-slate-400">·</span>
              <a
                href="https://tally.so/r/Y50Qb5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-cyan-400 hover:underline"
              >
                Share Feedback
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

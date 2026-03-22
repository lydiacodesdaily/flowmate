"use client";

export const MobileLandingPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-8 py-12 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      {/* Logo + Branding */}
      <div className="text-center mb-10">
        <div className="w-28 h-28 mx-auto mb-5">
          <img src="/flowmato/flowmato.png" alt="Flowmato" className="w-full h-full object-contain drop-shadow-xl" />
        </div>
        <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-2 tracking-tight">
          Flowmate
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Focus timer with audio announcements
        </p>
      </div>

      {/* Primary CTA — Android */}
      <a
        href="https://play.google.com/store/apps/details?id=club.flowmate.app"
        target="_blank"
        rel="noopener noreferrer"
        className="w-full max-w-xs mb-3 flex items-center justify-center gap-3 bg-slate-800 dark:bg-white text-white dark:text-slate-900 font-semibold py-4 px-6 rounded-2xl shadow-lg active:scale-95 transition-transform"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
          <path d="M17.523 15.341a.75.75 0 0 1-.75.75H7.227a.75.75 0 0 1-.75-.75V9.114c0-.414.336-.75.75-.75h9.546c.414 0 .75.336.75.75v6.227ZM4.5 9.864a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm15 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3ZM8.182 3.44l-1.09-1.94a.375.375 0 0 0-.65.375l1.1 1.96A6.787 6.787 0 0 0 5.25 7.5h13.5a6.787 6.787 0 0 0-2.292-3.665l1.1-1.96a.375.375 0 0 0-.65-.375l-1.09 1.94A6.71 6.71 0 0 0 12 3c-1.38 0-2.666.414-3.818 1.44ZM9.75 6a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Zm4.5 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
        </svg>
        Download on Android
      </a>

      {/* Secondary — iOS */}
      <div className="w-full max-w-xs flex items-center justify-center gap-3 bg-white/30 dark:bg-white/10 text-slate-600 dark:text-slate-400 text-sm font-medium py-3 px-6 rounded-2xl border border-white/40 dark:border-white/10 mb-10">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 flex-shrink-0">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
        </svg>
        iOS coming soon
      </div>

      {/* Desktop note */}
      <p className="text-xs text-slate-500 dark:text-slate-500 text-center mb-8 max-w-xs leading-relaxed">
        Full experience available on desktop — audio announcements, PiP mode, and more.
      </p>

      {/* Footer */}
      <div className="text-center space-y-2">
        <div className="text-xs text-slate-500 dark:text-slate-500">
          Made by Liddy 🦥✨
        </div>
        <div className="flex items-center justify-center gap-4 text-xs">
          <a
            href="https://lydiastud.io"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:underline"
          >
            Lydia Studio
          </a>
          <span className="text-slate-400">·</span>
          <a
            href="https://tally.so/r/Y50Qb5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-600 dark:text-slate-400 hover:underline"
          >
            Share Feedback
          </a>
        </div>
      </div>
    </div>
  );
};

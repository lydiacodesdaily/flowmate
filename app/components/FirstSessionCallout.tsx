"use client";

import { useEffect, useState } from "react";

interface FirstSessionCalloutProps {
  onOpenSettings: () => void;
  showCallout: boolean;
}

export const FirstSessionCallout = ({ onOpenSettings, showCallout }: FirstSessionCalloutProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (showCallout) {
      setIsVisible(true);
      localStorage.setItem('hasSeenCallout', 'true');

      // Auto-dismiss after 7 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [showCallout]);

  const handleOpenSettings = () => {
    localStorage.setItem('hasOpenedSettings', 'true');
    setIsVisible(false);
    onOpenSettings();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-slideUp">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-4 sm:p-5 max-w-sm mx-4 border-2 border-blue-400 dark:border-cyan-400">
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <p className="text-sm sm:text-base text-slate-700 dark:text-slate-200 mb-3">
              <span className="font-semibold">Flowmate is fully customizable</span> 💙
              <br />
              <span className="text-slate-600 dark:text-slate-300">
                You can turn sounds on/off, change announcements, and more in Settings.
              </span>
            </p>
            <button
              onClick={handleOpenSettings}
              className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-cyan-500 dark:to-blue-500 text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Open Settings
            </button>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

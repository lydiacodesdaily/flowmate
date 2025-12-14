"use client";

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  tickSound: string;
  setTickSound: (sound: string) => void;
  tickVolume: number;
  setTickVolume: (volume: number) => void;
  announcementVolume: number;
  setAnnouncementVolume: (volume: number) => void;
  muteBreak: boolean;
  setMuteBreak: (mute: boolean) => void;
  enableConfetti: boolean;
  setEnableConfetti: (enable: boolean) => void;
  enableMinuteAnnouncements: boolean;
  setEnableMinuteAnnouncements: (enable: boolean) => void;
  enableFinalCountdown: boolean;
  setEnableFinalCountdown: (enable: boolean) => void;
  enableDingCheckpoints: boolean;
  setEnableDingCheckpoints: (enable: boolean) => void;
  isMobile: boolean;
}

export const SettingsModal = ({
  showSettings,
  setShowSettings,
  tickSound,
  setTickSound,
  tickVolume,
  setTickVolume,
  announcementVolume,
  setAnnouncementVolume,
  muteBreak,
  setMuteBreak,
  enableConfetti,
  setEnableConfetti,
  enableMinuteAnnouncements,
  setEnableMinuteAnnouncements,
  enableFinalCountdown,
  setEnableFinalCountdown,
  enableDingCheckpoints,
  setEnableDingCheckpoints,
  isMobile,
}: SettingsModalProps) => {
  if (!showSettings) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => setShowSettings(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-slate-600 dark:text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Audio Settings */}
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-cyan-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Audio</h3>

            {/* Tick Sound Selection - Disabled on mobile */}
            {!isMobile && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Tick sound
                </label>
                <select
                  value={tickSound}
                  onChange={(e) => {
                    const newSound = e.target.value;
                    setTickSound(newSound);
                    localStorage.setItem('tickSound', newSound);
                  }}
                  className="w-full px-4 py-3 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="tick-tok-alternate.mp3">Tick–Tock (Alternating)</option>
                  <option value="tick.m4a">Tick (Single)</option>
                  <option value="beep1.mp3">High Beep</option>
                  <option value="beep2.mp3">Low Beep</option>
                  <option value="tick1.mp3">Soft Tick</option>
                  <option value="tok1.mp3">Soft Tok</option>
                  <option value="">None (Silent)</option>
                </select>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                  On some phones, ticks may drift when the browser is in the background.
                </p>
              </div>
            )}

            {/* Tick Volume Slider - Disabled on mobile */}
            {!isMobile && (
              <div className="mb-5">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  <span>Tick volume</span>
                  <span className="font-mono text-blue-600 dark:text-cyan-400 font-semibold">{Math.round(tickVolume * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={tickVolume}
                  onChange={(e) => {
                    const newVolume = parseFloat(e.target.value);
                    setTickVolume(newVolume);
                    localStorage.setItem('tickVolume', String(newVolume));
                  }}
                  className="w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400 transition-all"
                  style={{
                    background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${tickVolume * 100}%, rgb(203, 213, 225) ${tickVolume * 100}%, rgb(203, 213, 225) 100%)`,
                  }}
                />
              </div>
            )}

            {/* Announcement Volume Slider */}
            <div className="mb-5">
              <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                <span>Announcement Volume</span>
                <span className="font-mono text-blue-600 dark:text-cyan-400 font-semibold">{Math.round(announcementVolume * 100)}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={announcementVolume}
                onChange={(e) => {
                  const newVolume = parseFloat(e.target.value);
                  setAnnouncementVolume(newVolume);
                  localStorage.setItem('announcementVolume', String(newVolume));
                }}
                className="w-full h-3 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400 transition-all"
                style={{
                  background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${announcementVolume * 100}%, rgb(203, 213, 225) ${announcementVolume * 100}%, rgb(203, 213, 225) 100%)`,
                }}
              />
            </div>

            {/* Announcements Section */}
            <div className="space-y-3 mt-5">
              <h4 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">Announcements</h4>

              {/* Minute Announcements Toggle */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="minute-announcements" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Minute announcements
                </label>
                <input
                  id="minute-announcements"
                  type="checkbox"
                  checked={enableMinuteAnnouncements}
                  onChange={(e) => {
                    setEnableMinuteAnnouncements(e.target.checked);
                    localStorage.setItem('enableMinuteAnnouncements', String(e.target.checked));
                  }}
                  className="w-5 h-5 text-blue-600 dark:text-cyan-500 bg-slate-100 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Final Countdown Toggle */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="final-countdown" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Final countdown (10 → 1)
                </label>
                <input
                  id="final-countdown"
                  type="checkbox"
                  checked={enableFinalCountdown}
                  onChange={(e) => {
                    setEnableFinalCountdown(e.target.checked);
                    localStorage.setItem('enableFinalCountdown', String(e.target.checked));
                  }}
                  className="w-5 h-5 text-blue-600 dark:text-cyan-500 bg-slate-100 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Ding Checkpoints Toggle */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="ding-checkpoints" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Ding checkpoints (for long timers)
                </label>
                <input
                  id="ding-checkpoints"
                  type="checkbox"
                  checked={enableDingCheckpoints}
                  onChange={(e) => {
                    setEnableDingCheckpoints(e.target.checked);
                    localStorage.setItem('enableDingCheckpoints', String(e.target.checked));
                  }}
                  className="w-5 h-5 text-blue-600 dark:text-cyan-500 bg-slate-100 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 cursor-pointer"
                />
              </div>

              {/* Mute During Breaks Toggle */}
              <div className="flex items-center justify-between py-2">
                <label htmlFor="mute-breaks" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mute during breaks
                </label>
                <input
                  id="mute-breaks"
                  type="checkbox"
                  checked={muteBreak}
                  onChange={(e) => {
                    setMuteBreak(e.target.checked);
                    if (e.target.checked && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="w-5 h-5 text-blue-600 dark:text-cyan-500 bg-slate-100 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Visual Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-700 dark:text-cyan-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">Visual</h3>

            {/* Confetti Toggle */}
            <div className="flex items-center justify-between py-2">
              <label htmlFor="enable-confetti" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Confetti celebration
              </label>
              <input
                id="enable-confetti"
                type="checkbox"
                checked={enableConfetti}
                onChange={(e) => {
                  setEnableConfetti(e.target.checked);
                  localStorage.setItem('enableConfetti', String(e.target.checked));
                }}
                className="w-5 h-5 text-blue-600 dark:text-cyan-500 bg-slate-100 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:focus:ring-cyan-500 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

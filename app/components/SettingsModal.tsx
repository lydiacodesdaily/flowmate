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

            {/* Second Sound Selection - Disabled on mobile */}
            {!isMobile && (
              <div className="mb-5">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Second Sound
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
                  <option value="tick-tok-alternate.mp3">Tick-Tok Alternating</option>
                  <option value="tick.m4a">Mechanical Tick</option>
                  <option value="beep1.mp3">High Beep</option>
                  <option value="beep2.mp3">Low Beep</option>
                  <option value="tick1.mp3">Soft Tick</option>
                  <option value="tok1.mp3">Soft Tok</option>
                </select>
              </div>
            )}

            {/* Second Volume Slider - Disabled on mobile */}
            {!isMobile && (
              <div className="mb-5">
                <label className="flex items-center justify-between text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  <span>Second Volume</span>
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

            {/* Mute During Breaks Toggle */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-slate-600 dark:text-slate-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <label htmlFor="mute-breaks" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                  Mute During Breaks
                </label>
              </div>
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
      </div>
    </div>
  );
};

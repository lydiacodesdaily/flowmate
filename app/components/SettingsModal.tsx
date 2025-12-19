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
  minuteAnnouncementInterval: number;
  setMinuteAnnouncementInterval: (interval: number) => void;
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
  minuteAnnouncementInterval,
  setMinuteAnnouncementInterval,
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
            <h3 className="text-lg font-semibold text-slate-700 dark:text-cyan-400 mb-4 pb-2 border-b border-slate-200 dark:border-slate-700">🔊 Audio</h3>

            {/* Tick Sound Toggle and Settings */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="tick-sound-enabled" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Tick sound
                  </label>
                  {isMobile && (
                    <div className="group relative">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 cursor-help">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                      <div className="absolute left-0 top-full mt-1 w-56 p-2.5 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed">
                        Tick sounds on mobile may impact battery life and performance. Default is muted.
                      </div>
                    </div>
                  )}
                </div>
                <button
                    id="tick-sound-enabled"
                    onClick={() => {
                      const newVolume = tickVolume > 0 ? 0 : 0.5;
                      setTickVolume(newVolume);
                      localStorage.setItem('tickVolume', String(newVolume));
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                      tickVolume > 0 ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        tickVolume > 0 ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <div className={`ml-6 space-y-3 transition-opacity duration-200 ${tickVolume === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      Style
                    </label>
                    <select
                      value={tickSound}
                      onChange={(e) => {
                        const newSound = e.target.value;
                        setTickSound(newSound);
                        localStorage.setItem('tickSound', newSound);
                      }}
                      disabled={tickVolume === 0}
                      className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200 disabled:cursor-not-allowed"
                    >
                      <option value="tick1.mp3">Single</option>
                      <option value="tick-tok-alternate.mp3">Alternating</option>
                      <option value="tick.m4a">Classic</option>
                      <option value="beep1.mp3">High Beep</option>
                      <option value="beep2.mp3">Low Beep</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      <span>Volume</span>
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
                      disabled={tickVolume === 0}
                      className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400 transition-all disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${tickVolume * 100}%, rgb(203, 213, 225) ${tickVolume * 100}%, rgb(203, 213, 225) 100%)`,
                      }}
                    />
                  </div>
                </div>
            </div>

            {/* Voice Announcements Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between py-2 mb-3">
                <div className="flex items-center gap-1.5">
                  <label htmlFor="voice-announcements" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                    Voice announcements
                  </label>
                  <div className="group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                    </svg>
                    <div className="absolute left-0 top-full mt-1 w-56 p-2.5 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed">
                      <div className="font-semibold mb-1">Voice announcements play:</div>
                      <div>• Every 5 min for sessions ≥25 min</div>
                      <div>• Every 1 min in the final stretch</div>
                      <div>• Countdown: 50, 40, 30, 20, 10, 9...1 sec</div>
                    </div>
                  </div>
                </div>
                <button
                  id="voice-announcements"
                  onClick={() => {
                    const newVolume = announcementVolume > 0 ? 0 : 0.5;
                    setAnnouncementVolume(newVolume);
                    localStorage.setItem('announcementVolume', String(newVolume));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                    announcementVolume > 0 ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      announcementVolume > 0 ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {announcementVolume > 0 && (
                <div className="ml-6 space-y-4">
                  {/* Volume Slider */}
                  <div>
                    <label className="flex items-center justify-between text-xs font-medium text-slate-600 dark:text-slate-400 mb-2">
                      <span>Volume</span>
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
                      className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-cyan-400 transition-all"
                      style={{
                        background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${announcementVolume * 100}%, rgb(203, 213, 225) ${announcementVolume * 100}%, rgb(203, 213, 225) 100%)`,
                      }}
                    />
                  </div>

                  {/* Minute Announcements */}
                  <div>
                    <div className="flex items-center justify-between py-1.5">
                      <label htmlFor="minute-announcements" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                        Interval
                      </label>
                      <button
                        id="minute-announcements"
                        onClick={() => {
                          setEnableMinuteAnnouncements(!enableMinuteAnnouncements);
                          localStorage.setItem('enableMinuteAnnouncements', String(!enableMinuteAnnouncements));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                          enableMinuteAnnouncements ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                            enableMinuteAnnouncements ? 'translate-x-5' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {enableMinuteAnnouncements && (
                      <select
                        id="minute-interval"
                        value={minuteAnnouncementInterval}
                        onChange={(e) => {
                          const newInterval = parseInt(e.target.value, 10);
                          setMinuteAnnouncementInterval(newInterval);
                          localStorage.setItem('minuteAnnouncementInterval', String(newInterval));
                        }}
                        className="w-full px-3 py-1.5 mt-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 cursor-pointer"
                      >
                        <option value="1">Every 1 minute</option>
                        <option value="2">Every 2 minutes</option>
                        <option value="3">Every 3 minutes</option>
                        <option value="5">Every 5 minutes</option>
                        <option value="10">Every 10 minutes</option>
                      </select>
                    )}
                  </div>

                  {/* Seconds Countdown */}
                  <div className="flex items-center justify-between py-1.5">
                    <label htmlFor="seconds-countdown" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                      Seconds countdown (50, 40...1)
                    </label>
                    <button
                      id="seconds-countdown"
                      onClick={() => {
                        setEnableFinalCountdown(!enableFinalCountdown);
                        localStorage.setItem('enableFinalCountdown', String(!enableFinalCountdown));
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                        enableFinalCountdown ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          enableFinalCountdown ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Ding Checkpoints */}
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-1.5">
                      <label htmlFor="ding-checkpoints" className="text-xs font-medium text-slate-600 dark:text-slate-400 cursor-pointer">
                        Checkpoints
                      </label>
                      <div className="group relative">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                        </svg>
                        <div className="absolute left-0 top-full mt-1 w-48 p-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                          Plays a ding sound every 5 minutes during long focus sessions (over 25 minutes)
                        </div>
                      </div>
                    </div>
                    <button
                      id="ding-checkpoints"
                      onClick={() => {
                        setEnableDingCheckpoints(!enableDingCheckpoints);
                        localStorage.setItem('enableDingCheckpoints', String(!enableDingCheckpoints));
                      }}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                        enableDingCheckpoints ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                          enableDingCheckpoints ? 'translate-x-5' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mute During Breaks */}
            <div className="flex items-center justify-between py-2 border-t border-slate-200 dark:border-slate-700 pt-4">
              <label htmlFor="mute-breaks" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Mute during breaks
              </label>
              <button
                id="mute-breaks"
                onClick={() => {
                  setMuteBreak(!muteBreak);
                  if (!muteBreak && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel();
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                  muteBreak ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    muteBreak ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
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
              <button
                id="enable-confetti"
                onClick={() => {
                  setEnableConfetti(!enableConfetti);
                  localStorage.setItem('enableConfetti', String(!enableConfetti));
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                  enableConfetti ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    enableConfetti ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

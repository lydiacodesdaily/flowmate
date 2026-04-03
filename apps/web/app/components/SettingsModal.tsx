"use client";

import { useState, useRef } from 'react';
import { AUDIO_PRESETS } from '../constants/audioPresets';

interface SettingsModalProps {
  showSettings: boolean;
  setShowSettings: (show: boolean) => void;
  tickSound: string;
  setTickSound: (sound: string) => void;
  tickVolume: number;
  setTickVolume: (volume: number) => void;
  announcementVolume: number;
  setAnnouncementVolume: (volume: number) => void;
  transitionVolume: number;
  setTransitionVolume: (volume: number) => void;
  muteBreak: boolean;
  setMuteBreak: (mute: boolean) => void;
  enableConfetti: boolean;
  setEnableConfetti: (enable: boolean) => void;
  minuteAnnouncementInterval: number;
  setMinuteAnnouncementInterval: (interval: number) => void;
  enableFinalCountdown: boolean;
  setEnableFinalCountdown: (enable: boolean) => void;
  enableDingCheckpoints: boolean;
  setEnableDingCheckpoints: (enable: boolean) => void;
  enableTransitionSounds: boolean;
  setEnableTransitionSounds: (enable: boolean) => void;
  audioPreset: string;
  setAudioPreset: (id: string) => void;
  theme: 'light' | 'dark' | 'system';
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  isMobile: boolean;
  isPremium: boolean;
  openPaywall: () => void;
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
  transitionVolume,
  setTransitionVolume,
  muteBreak,
  setMuteBreak,
  enableConfetti,
  setEnableConfetti,
  minuteAnnouncementInterval,
  setMinuteAnnouncementInterval,
  enableFinalCountdown,
  setEnableFinalCountdown,
  enableDingCheckpoints,
  setEnableDingCheckpoints,
  enableTransitionSounds,
  setEnableTransitionSounds,
  audioPreset,
  setAudioPreset,
  theme,
  setTheme,
  isMobile,
  isPremium,
  openPaywall,
}: SettingsModalProps) => {
  const [activeTab, setActiveTab] = useState<'audio' | 'visual'>('audio');
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);

  const previewTickSound = (soundValue: string) => {
    // Stop any in-progress preview
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
      previewAudioRef.current = null;
    }
    // Map sound values to their audio file paths (mirrors page.tsx logic)
    const path = soundValue === 'tick-tok-alternate.mp3'
      ? '/audio/effects/tick1.mp3'
      : soundValue === 'tick-tok-alternate-2.wav'
      ? '/audio/effects/tick2.wav'
      : `/audio/effects/${soundValue}`;
    const audio = new Audio(path);
    audio.volume = tickVolume > 0 ? tickVolume : 0.3;
    previewAudioRef.current = audio;
    audio.play().catch(() => {});
  };

  if (!showSettings) return null;

  const applyPreset = (presetId: string) => {
    const preset = AUDIO_PRESETS.find(p => p.id === presetId);
    if (!preset || preset.id === 'custom') {
      setAudioPreset('custom');
      localStorage.setItem('audioPreset', 'custom');
      return;
    }
    const c = preset.config;
    setTickVolume(c.tickVolume);
    localStorage.setItem('tickVolume', String(c.tickVolume));
    setTickSound(c.tickSound);
    localStorage.setItem('tickSound', c.tickSound);
    setAnnouncementVolume(c.announcementVolume);
    localStorage.setItem('announcementVolume', String(c.announcementVolume));
    setTransitionVolume(c.transitionVolume);
    localStorage.setItem('transitionVolume', String(c.transitionVolume));
    setMinuteAnnouncementInterval(c.minuteAnnouncementInterval);
    localStorage.setItem('minuteAnnouncementInterval', String(c.minuteAnnouncementInterval));
    setEnableFinalCountdown(c.enableFinalCountdown);
    localStorage.setItem('enableFinalCountdown', String(c.enableFinalCountdown));
    setEnableDingCheckpoints(c.enableDingCheckpoints);
    localStorage.setItem('enableDingCheckpoints', String(c.enableDingCheckpoints));
    setEnableTransitionSounds(c.enableTransitionSounds);
    localStorage.setItem('enableTransitionSounds', String(c.enableTransitionSounds));
    setMuteBreak(c.muteBreak);
    setAudioPreset(preset.id);
    localStorage.setItem('audioPreset', preset.id);
  };

  const markCustom = () => {
    setAudioPreset('custom');
    localStorage.setItem('audioPreset', 'custom');
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn"
      onClick={() => setShowSettings(false)}
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-lg mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 shrink-0">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Settings</h2>
          <button
            onClick={() => setShowSettings(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200 text-slate-500 dark:text-slate-400"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('audio')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'audio'
                ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
            </svg>
            Audio
          </button>
          <button
            onClick={() => setActiveTab('visual')}
            className={`flex items-center gap-1.5 py-2.5 px-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
              activeTab === 'visual'
                ? 'border-blue-600 dark:border-cyan-400 text-blue-600 dark:text-cyan-400'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Visual
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-600 [&::-webkit-scrollbar-thumb]:rounded-full"
        >
          {activeTab === 'audio' && (
            <div className="space-y-6">
              {/* Audio Presets */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Preset
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {AUDIO_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => applyPreset(preset.id)}
                      className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl border-2 text-xs font-medium transition-all duration-200 ${
                        audioPreset === preset.id
                          ? 'border-blue-600 dark:border-cyan-500 bg-blue-50 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:border-blue-300 dark:hover:border-cyan-700'
                      }`}
                      title={preset.description}
                    >
                      <span className="text-base leading-none">{preset.icon}</span>
                      <span>{preset.name}</span>
                    </button>
                  ))}
                </div>
                {audioPreset !== 'custom' && (
                  <p className="mt-2 text-xs text-slate-400 dark:text-slate-500 text-center">
                    {AUDIO_PRESETS.find(p => p.id === audioPreset)?.description}
                  </p>
                )}
              </div>

              {/* Tick Sound */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tick sound</span>
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
                    onClick={() => {
                      markCustom();
                      if (tickVolume > 0) {
                        localStorage.setItem('lastTickVolume', String(tickVolume));
                        setTickVolume(0);
                        localStorage.setItem('tickVolume', '0');
                      } else {
                        const savedVolume = localStorage.getItem('lastTickVolume');
                        const newVolume = savedVolume ? parseFloat(savedVolume) : 0.05;
                        setTickVolume(newVolume);
                        localStorage.setItem('tickVolume', String(newVolume));
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                      tickVolume > 0 ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${tickVolume > 0 ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className={`ml-4 space-y-3 transition-opacity duration-200 ${tickVolume === 0 ? 'opacity-40 pointer-events-none' : ''}`}>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Style</label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { value: 'tick-tok-alternate.mp3', label: 'Alternating', premium: false },
                        { value: 'single_tick.wav', label: 'Single', premium: true },
                        { value: 'tick-tok-alternate-2.wav', label: 'Alternating 2', premium: true },
                        { value: 'tick.m4a', label: 'Classic', premium: true },
                        { value: 'beep.wav', label: 'Beep', premium: true },
                        { value: 'beep1.mp3', label: 'High Beep', premium: true },
                        { value: 'beep2.mp3', label: 'Low Beep', premium: true },
                      ].map((opt) => {
                        const locked = opt.premium && !isPremium;
                        const selected = tickSound === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              previewTickSound(opt.value);
                              if (locked) return;
                              markCustom();
                              setTickSound(opt.value);
                              localStorage.setItem('tickSound', opt.value);
                            }}
                            disabled={tickVolume === 0}
                            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border-2 transition-all duration-150 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed ${
                              selected
                                ? 'bg-blue-600 dark:bg-cyan-500 border-blue-600 dark:border-cyan-500 text-white'
                                : locked
                                ? 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-500'
                                : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-500'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                    {!isPremium && (
                      <p className="mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                        Tap any sound to preview.{' '}
                        <button type="button" onClick={openPaywall} className="underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          Upgrade
                        </button>
                        {' '}to unlock all.
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
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
                        markCustom();
                        const v = parseFloat(e.target.value);
                        setTickVolume(v);
                        localStorage.setItem('tickVolume', String(v));
                      }}
                      disabled={tickVolume === 0}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all disabled:cursor-not-allowed"
                      style={{
                        background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${tickVolume * 100}%, rgb(203, 213, 225) ${tickVolume * 100}%, rgb(203, 213, 225) 100%)`,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700" />

              {/* Voice Announcements */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Voice announcements</span>
                    <div className="group relative">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <div className="absolute left-0 top-full mt-1 w-64 p-2.5 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none leading-relaxed">
                        <div className="font-semibold mb-1.5">Audio adapts by session length:</div>
                        <div className="mb-1.5">
                          <div className="font-medium text-cyan-300">Short (≤25 min):</div>
                          <div className="text-slate-300 ml-2">• Minute announcements</div>
                          <div className="text-slate-300 ml-2">• Final countdown</div>
                        </div>
                        <div>
                          <div className="font-medium text-cyan-300">Long (&gt;25 min):</div>
                          <div className="text-slate-300 ml-2">• Checkpoint dings only</div>
                          <div className="text-slate-300 ml-2">• No verbal countdown</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      markCustom();
                      if (announcementVolume > 0) {
                        localStorage.setItem('lastAnnouncementVolume', String(announcementVolume));
                        setAnnouncementVolume(0);
                        localStorage.setItem('announcementVolume', '0');
                      } else {
                        const savedVolume = localStorage.getItem('lastAnnouncementVolume');
                        const newVolume = savedVolume ? parseFloat(savedVolume) : 0.35;
                        setAnnouncementVolume(newVolume);
                        localStorage.setItem('announcementVolume', String(newVolume));
                      }
                    }}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                      announcementVolume > 0 ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${announcementVolume > 0 ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {announcementVolume > 0 && (
                  <div className="ml-4 space-y-3">
                    <div>
                      <label className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
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
                          markCustom();
                          const v = parseFloat(e.target.value);
                          setAnnouncementVolume(v);
                          localStorage.setItem('announcementVolume', String(v));
                        }}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all"
                        style={{
                          background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${announcementVolume * 100}%, rgb(203, 213, 225) ${announcementVolume * 100}%, rgb(203, 213, 225) 100%)`,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">Interval</label>
                      <select
                        value={minuteAnnouncementInterval}
                        onChange={(e) => {
                          markCustom();
                          const v = parseInt(e.target.value, 10);
                          setMinuteAnnouncementInterval(v);
                          localStorage.setItem('minuteAnnouncementInterval', String(v));
                        }}
                        className="w-full px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 cursor-pointer"
                      >
                        <option value="1">Every 1 minute</option>
                        <option value="2">Every 2 minutes</option>
                        <option value="3">Every 3 minutes</option>
                        <option value="5">Every 5 minutes</option>
                        <option value="10">Every 10 minutes</option>
                      </select>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Seconds countdown (50, 40…1)</span>
                      <button
                        onClick={() => {
                          markCustom();
                          setEnableFinalCountdown(!enableFinalCountdown);
                          localStorage.setItem('enableFinalCountdown', String(!enableFinalCountdown));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                          enableFinalCountdown ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enableFinalCountdown ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Checkpoints</span>
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
                        onClick={() => {
                          markCustom();
                          setEnableDingCheckpoints(!enableDingCheckpoints);
                          localStorage.setItem('enableDingCheckpoints', String(!enableDingCheckpoints));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                          enableDingCheckpoints ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enableDingCheckpoints ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Session start/end sounds — shown when voice announcements are off */}
                {announcementVolume === 0 && (
                  <div className="ml-4 space-y-3">
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Session start/end sounds</span>
                        <div className="group relative">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 cursor-help">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                          </svg>
                          <div className="absolute left-0 top-full mt-1 w-52 p-2 bg-slate-800 dark:bg-slate-900 text-white text-xs rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none">
                            Plays a short chime when a focus or break session starts and ends
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          markCustom();
                          setEnableTransitionSounds(!enableTransitionSounds);
                          localStorage.setItem('enableTransitionSounds', String(!enableTransitionSounds));
                        }}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                          enableTransitionSounds ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                        }`}
                      >
                        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${enableTransitionSounds ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    {enableTransitionSounds && (
                      <div>
                        <label className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">
                          <span>Volume</span>
                          <span className="font-mono text-blue-600 dark:text-cyan-400 font-semibold">{Math.round(transitionVolume * 100)}%</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={transitionVolume}
                          onChange={(e) => {
                            markCustom();
                            const v = parseFloat(e.target.value);
                            setTransitionVolume(v);
                            localStorage.setItem('transitionVolume', String(v));
                          }}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer transition-all"
                          style={{
                            background: `linear-gradient(to right, rgb(37, 99, 235) 0%, rgb(37, 99, 235) ${transitionVolume * 100}%, rgb(203, 213, 225) ${transitionVolume * 100}%, rgb(203, 213, 225) 100%)`,
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700" />

              {/* Mute During Breaks */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mute during breaks</span>
                <button
                  onClick={() => {
                    markCustom();
                    setMuteBreak(!muteBreak);
                    if (!muteBreak && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                    muteBreak ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${muteBreak ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Audio Behavior Note */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/50 rounded-xl">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  <span className="font-medium text-slate-600 dark:text-cyan-300">Audio adapts by design:</span> Longer sessions use fewer prompts to support deep focus; shorter sessions provide more frequent cues.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'visual' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Theme</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-3 py-3 text-sm rounded-xl border-2 transition-all duration-200 ${
                      theme === 'light'
                        ? 'border-blue-600 dark:border-cyan-500 bg-blue-50 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
                    </svg>
                    Light
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-3 py-3 text-sm rounded-xl border-2 transition-all duration-200 ${
                      theme === 'dark'
                        ? 'border-blue-600 dark:border-cyan-500 bg-blue-50 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
                    </svg>
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme('system')}
                    className={`px-3 py-3 text-sm rounded-xl border-2 transition-all duration-200 ${
                      theme === 'system'
                        ? 'border-blue-600 dark:border-cyan-500 bg-blue-50 dark:bg-cyan-950 text-blue-700 dark:text-cyan-300 font-semibold'
                        : 'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-blue-400 dark:hover:border-cyan-600'
                    }`}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mx-auto mb-1">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                    </svg>
                    System
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-700" />

              {/* Confetti */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Confetti celebration</span>
                <button
                  onClick={() => {
                    setEnableConfetti(!enableConfetti);
                    localStorage.setItem('enableConfetti', String(!enableConfetti));
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800 ${
                    enableConfetti ? 'bg-blue-600 dark:bg-cyan-500' : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enableConfetti ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

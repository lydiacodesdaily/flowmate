"use client";

import { useState, useEffect, useRef } from "react";

type SessionType = "focus" | "break";
type SessionDuration = 30 | 60 | 90 | 120 | 180;
type TimerMode = "pomodoro" | "flowclub";

interface PomodoroSession {
  type: SessionType;
  duration: number; // in seconds
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

export default function Home() {
  const [timerMode, setTimerMode] = useState<TimerMode>("pomodoro");
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [muteBreak, setMuteBreak] = useState(false);
  const [muteAll, setMuteAll] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const lastMinuteAnnouncedRef = useRef<number>(-1);
  const muteAllRef = useRef<boolean>(false);
  const pipWindowRef = useRef<Window | null>(null);
  const isPausedRef = useRef<boolean>(false);
  const timeRemainingRef = useRef<number>(0);
  const currentSessionIndexRef = useRef<number>(0);
  const sessionsRef = useRef<PomodoroSession[]>([]);

  // Sync refs with state
  useEffect(() => {
    muteAllRef.current = muteAll;
  }, [muteAll]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    timeRemainingRef.current = timeRemaining;
  }, [timeRemaining]);

  useEffect(() => {
    currentSessionIndexRef.current = currentSessionIndex;
  }, [currentSessionIndex]);

  useEffect(() => {
    sessionsRef.current = sessions;
  }, [sessions]);

  // Picture-in-Picture functions
  const openPiP = async () => {
    if (!('documentPictureInPicture' in window)) {
      console.log('Document Picture-in-Picture API not supported');
      return;
    }

    try {
      // Close existing PiP window if any
      if (pipWindowRef.current) {
        pipWindowRef.current.close();
      }

      // Open PiP window
      const pipWindow = await (window as any).documentPictureInPicture.requestWindow({
        width: 300,
        height: 200,
      });

      pipWindowRef.current = pipWindow;

      // Copy styles to PiP window
      const styleSheets = Array.from(document.styleSheets);
      styleSheets.forEach((styleSheet) => {
        try {
          const cssRules = Array.from(styleSheet.cssRules).map((rule) => rule.cssText).join('');
          const style = pipWindow.document.createElement('style');
          style.textContent = cssRules;
          pipWindow.document.head.appendChild(style);
        } catch (e) {
          // Handle cross-origin stylesheets
          const link = pipWindow.document.createElement('link');
          link.rel = 'stylesheet';
          link.href = (styleSheet as any).href;
          pipWindow.document.head.appendChild(link);
        }
      });

      // Create PiP content
      const container = pipWindow.document.createElement('div');
      container.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        padding: 20px;
      `;
      container.id = 'pip-container';
      pipWindow.document.body.appendChild(container);

      // Create initial HTML structure with IDs for elements
      const currentSession = sessions[currentSessionIndex];
      const sessionType = currentSession?.type === "focus" ? "🎯 Focus Time" : "☕ Break Time";
      const sessionColor = currentSession?.type === "focus" ? "#FFF" : "#2FC6A5";

      container.innerHTML = `
        <div style="text-align: center;">
          <div id="pip-session-type" style="font-size: 18px; font-weight: 600; margin-bottom: 10px; color: ${sessionColor};">
            ${sessionType}
          </div>
          <div id="pip-timer" style="font-size: 48px; font-weight: bold; font-family: 'SF Mono', 'Monaco', monospace; margin-bottom: 15px;">
            ${formatTime(timeRemaining)}
          </div>
          <div style="display: flex; gap: 10px; justify-content: center;">
            <button id="pip-pause-btn" style="
              background: rgba(255, 255, 255, 0.2);
              border: 2px solid white;
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            ">
              ${isPaused ? '▶️ Resume' : '⏸️ Pause'}
            </button>
            <button id="pip-mute-btn" style="
              background: rgba(255, 255, 255, 0.2);
              border: 2px solid white;
              color: white;
              padding: 8px 16px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 14px;
            ">
              ${muteAll ? '🔊 Unmute' : '🔇 Mute'}
            </button>
          </div>
        </div>
      `;

      // Get references to elements
      const sessionTypeEl = pipWindow.document.getElementById('pip-session-type');
      const timerEl = pipWindow.document.getElementById('pip-timer');
      const pauseBtn = pipWindow.document.getElementById('pip-pause-btn');
      const muteBtn = pipWindow.document.getElementById('pip-mute-btn');

      // Add event listeners ONCE
      if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
          setIsPaused((prev) => !prev);
        });
      }

      if (muteBtn) {
        muteBtn.addEventListener('click', () => {
          setMuteAll((prev) => !prev);
          if (!muteAll && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
          }
        });
      }

      // Update PiP content (only updates text, not the whole DOM)
      const updatePiPContent = () => {
        if (!pipWindow || pipWindow.closed) return;

        const currentSession = sessionsRef.current[currentSessionIndexRef.current];
        const sessionType = currentSession?.type === "focus" ? "🎯 Focus Time" : "☕ Break Time";
        const sessionColor = currentSession?.type === "focus" ? "#10b981" : "#3b82f6";

        // Update only the text content, not the entire structure
        if (sessionTypeEl) {
          sessionTypeEl.textContent = sessionType;
          sessionTypeEl.style.color = sessionColor;
        }
        if (timerEl) {
          timerEl.textContent = formatTime(timeRemainingRef.current);
        }
        if (pauseBtn) {
          pauseBtn.textContent = isPausedRef.current ? '▶️ Resume' : '⏸️ Pause';
        }
        if (muteBtn) {
          muteBtn.textContent = muteAllRef.current ? '🔊 Unmute' : '🔇 Mute';
        }
      };

      // Set up interval to update PiP content
      const updateInterval = setInterval(() => {
        if (pipWindow.closed) {
          clearInterval(updateInterval);
          pipWindowRef.current = null;
        } else {
          updatePiPContent();
        }
      }, 100);

      // Clean up when PiP window closes
      pipWindow.addEventListener('pagehide', () => {
        clearInterval(updateInterval);
        pipWindowRef.current = null;
      });

    } catch (error) {
      console.error('Failed to open PiP window:', error);
    }
  };

  const closePiP = () => {
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
      pipWindowRef.current = null;
    }
  };

  // Auto-open PiP when tab becomes hidden, close when visible
  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = () => {
      if (document.hidden && isRunning && !isPaused) {
        // Tab is hidden, open PiP
        openPiP();
      } else if (!document.hidden) {
        // Tab is visible, close PiP
        closePiP();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, isPaused]);

  // Clean up PiP window when component unmounts
  useEffect(() => {
    return () => {
      closePiP();
    };
  }, []);

  // Generate sessions based on selected duration and mode
  const generateSessions = (totalMinutes: SessionDuration): PomodoroSession[] => {
    const sessionsList: PomodoroSession[] = [];

    if (timerMode === "pomodoro") {
      const cycles = totalMinutes / 30; // Each cycle is 30 minutes (25 focus + 5 break)
      for (let i = 0; i < cycles; i++) {
        sessionsList.push({ type: "focus", duration: FOCUS_DURATION });
        sessionsList.push({ type: "break", duration: BREAK_DURATION });
      }
    } else {
      // Flow Club mode - breaks between focus sessions, last focus is always 20 min
      if (totalMinutes === 30) {
        // 30 min: 3 break, 24 focus, 3 break
        sessionsList.push({ type: "break", duration: 3 * 60 });
        sessionsList.push({ type: "focus", duration: 24 * 60 });
        sessionsList.push({ type: "break", duration: 3 * 60 });
      } else if (totalMinutes === 60) {
        // 60 min: 5 break, 25 focus, 5 break, 20 focus, 5 break
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 20 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
      } else if (totalMinutes === 120) {
        // 120 min: Repeat 60 min pattern twice
        for (let i = 0; i < 2; i++) {
          sessionsList.push({ type: "break", duration: 5 * 60 });
          sessionsList.push({ type: "focus", duration: 25 * 60 });
          sessionsList.push({ type: "break", duration: 5 * 60 });
          sessionsList.push({ type: "focus", duration: 20 * 60 });
        }
        // Final break
        sessionsList.push({ type: "break", duration: 5 * 60 });
      } else {
        // 90/180 min: Repeat 60 min pattern (5 break, 25 focus, 5 break, 20 focus)
        const cycles = Math.floor(totalMinutes / 60);
        for (let i = 0; i < cycles; i++) {
          sessionsList.push({ type: "break", duration: 5 * 60 });
          sessionsList.push({ type: "focus", duration: 25 * 60 });
          sessionsList.push({ type: "break", duration: 5 * 60 });
          sessionsList.push({ type: "focus", duration: 20 * 60 });
        }
        // Final break
        sessionsList.push({ type: "break", duration: 5 * 60 });
      }
    }

    return sessionsList;
  };

  // Start a session
  const startSession = (duration: SessionDuration) => {
    const sessionsList = generateSessions(duration);
    setSessions(sessionsList);
    setCurrentSessionIndex(0);
    setTimeRemaining(sessionsList[0].duration);
    setSelectedDuration(duration);
    setIsRunning(true);
    setIsPaused(false);
    lastMinuteAnnouncedRef.current = -1;

    // Initialize speech synthesis on user interaction (Chrome requirement)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Clear any pending speech
      // Speak empty string to "wake up" speech synthesis in Chrome
      const utterance = new SpeechSynthesisUtterance('');
      window.speechSynthesis.speak(utterance);
    }
  };

  // Reset everything
  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedDuration(null);
    setSessions([]);
    setCurrentSessionIndex(0);
    setTimeRemaining(0);
    lastMinuteAnnouncedRef.current = -1;
  };

  // Toggle pause
  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  // Adjust time (add or subtract seconds)
  const adjustTime = (seconds: number) => {
    setTimeRemaining((prev) => {
      const newTime = Math.max(0, prev + seconds);
      // Reset announcement tracking when time is adjusted
      lastMinuteAnnouncedRef.current = -1;
      return newTime;
    });
  };

  // Add more Pomodoro cycles (25 min focus + 5 min break)
  const addMoreCycles = (numCycles: number = 1) => {
    const newSessions: PomodoroSession[] = [];
    for (let i = 0; i < numCycles; i++) {
      newSessions.push({ type: "focus", duration: FOCUS_DURATION });
      newSessions.push({ type: "break", duration: BREAK_DURATION });
    }
    setSessions((prev) => [...prev, ...newSessions]);
  };

  // Speak text using Web Speech API
  const speak = (text: string) => {
    // Check if all sound is muted
    if (muteAllRef.current) {
      return;
    }

    // Check if we should mute during break sessions
    const currentSession = sessions[currentSessionIndex];
    if (muteBreak && currentSession?.type === "break") {
      return;
    }

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      // Try to use a better quality voice
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prefer enhanced/premium voices (Samantha, Alex on Mac, or Google voices)
        const preferredVoice = voices.find(voice =>
          voice.name.includes('Samantha') ||
          voice.name.includes('Google') ||
          voice.name.includes('Alex') ||
          (voice.lang.startsWith('en') && voice.localService === false)
        ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];

        utterance.voice = preferredVoice;
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize dark mode from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(savedDarkMode);
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      }
    }
  }, []);

  // Initialize speech synthesis voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Load voices
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        console.log('Speech synthesis voices loaded:', voices.length);
      };

      // Voices might load async, so we need to listen for the event
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }

      // Try loading immediately too
      loadVoices();
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      if (newValue) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('darkMode', String(newValue));
      return newValue;
    });
  };

  // Initialize Audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Initialize tick audio element
      tickAudioRef.current = new Audio('/tick.m4a');
      tickAudioRef.current.volume = 0.2;
      tickAudioRef.current.preload = 'auto';

      // Fallback: if file doesn't load, log error
      tickAudioRef.current.onerror = () => {
        console.log('Tick audio file not found');
      };
    }
  }, []);

  // Play tick sound using audio file
  const playTick = () => {
    if (!tickAudioRef.current) return;

    // Check if all sound is muted
    if (muteAllRef.current) {
      return;
    }

    // Check if we should mute during break sessions
    const currentSession = sessions[currentSessionIndex];
    if (muteBreak && currentSession?.type === "break") {
      return;
    }

    // Reset and play the audio
    tickAudioRef.current.currentTime = 0;
    tickAudioRef.current.play().catch(err => {
      // Ignore errors (e.g., if user hasn't interacted with page yet)
      console.log('Audio play failed:', err);
    });
  };

  // Main timer effect
  useEffect(() => {
    if (!isRunning || isPaused || sessions.length === 0) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;

        // Play tick sound every second
        playTick();

        // Announce remaining time
        if (newTime > 0) {
          const minutesRemaining = Math.floor(newTime / 60);
          const secondsRemaining = newTime % 60;

          if (minutesRemaining >= 1) {
            // Greater than 1 minute: announce at the start of each minute
            if (secondsRemaining === 0 && lastMinuteAnnouncedRef.current !== minutesRemaining) {
              speak(`${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
              lastMinuteAnnouncedRef.current = minutesRemaining;
            }
          } else {
            // Less than 1 minute
            if (newTime >= 10) {
              // Between 10-59 seconds: announce every 10 seconds (50, 40, 30, 20, 10)
              if (newTime % 10 === 0 && lastMinuteAnnouncedRef.current !== newTime) {
                speak(`${newTime} seconds`);
                lastMinuteAnnouncedRef.current = newTime;
              }
            } else {
              // Less than 10 seconds: countdown 9, 8, 7, 6, 5, 4, 3, 2, 1
              if (lastMinuteAnnouncedRef.current !== newTime) {
                speak(`${newTime}`);
                lastMinuteAnnouncedRef.current = newTime;
              }
            }
          }
        }

        // Session complete
        if (newTime <= 0) {
          const currentSession = sessions[currentSessionIndex];

          // Move to next session
          const nextIndex = currentSessionIndex + 1;
          if (nextIndex < sessions.length) {
            const nextSession = sessions[nextIndex];

            // Announce next session
            if (nextSession.type === "focus") {
              speak("Focus.");
            } else if (nextSession.type === "break") {
              speak("Break.");
            }

            setCurrentSessionIndex(nextIndex);
            lastMinuteAnnouncedRef.current = -1;
            return sessions[nextIndex].duration;
          } else {
            // All sessions complete
            speak("Done.");
            setIsRunning(false);
            return 0;
          }
        }

        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isPaused, currentSessionIndex, sessions]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate total progress
  const calculateProgress = (): number => {
    if (sessions.length === 0) return 0;

    let totalDuration = 0;
    let completedDuration = 0;

    sessions.forEach((session, index) => {
      totalDuration += session.duration;
      if (index < currentSessionIndex) {
        completedDuration += session.duration;
      } else if (index === currentSessionIndex) {
        completedDuration += (session.duration - timeRemaining);
      }
    });

    return (completedDuration / totalDuration) * 100;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Dark mode toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed top-4 right-4 p-3 rounded-full bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-200 text-gray-800 dark:text-gray-200"
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
          </svg>
        )}
      </button>

      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          Flowmate
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Pomodoro Timer with Audio Announcements
        </p>

        {!selectedDuration ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-6">
              <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-gray-100 dark:bg-gray-900">
                <button
                  onClick={() => setTimerMode("pomodoro")}
                  className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                    timerMode === "pomodoro"
                      ? "bg-white dark:bg-gray-800 text-indigo-600 shadow"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => setTimerMode("flowclub")}
                  className={`px-6 py-2 rounded-md font-semibold transition-all duration-200 ${
                    timerMode === "flowclub"
                      ? "bg-white dark:bg-gray-800 text-indigo-600 shadow"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                  }`}
                >
                  Flow Club
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              Select Session Duration
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {(timerMode === "pomodoro"
                ? [30, 60, 90, 180]
                : [30, 60, 90, 120, 180]
              ).map((duration) => (
                <button
                  key={duration}
                  onClick={() => startSession(duration as SessionDuration)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <div className="text-3xl mb-2">{duration} min</div>
                  <div className="text-sm opacity-90">
                    {timerMode === "pomodoro"
                      ? `${duration / 30}x Pomodoro`
                      : "Flow Club"}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            {/* Current session info */}
            <div className="text-center mb-6">
              <div className={`inline-block px-6 py-2 rounded-full text-white font-semibold ${
                sessions[currentSessionIndex]?.type === "focus"
                  ? "bg-green-500"
                  : "bg-blue-500"
              }`}>
                {sessions[currentSessionIndex]?.type === "focus" && "Focus Time"}
                {sessions[currentSessionIndex]?.type === "break" && "Break Time"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Session {currentSessionIndex + 1} of {sessions.length}
              </div>
            </div>

            {/* Timer display */}
            <div className="text-center mb-8">
              <div className="text-8xl font-bold text-gray-800 dark:text-white mb-4 font-mono">
                {formatTime(timeRemaining)}
              </div>

              {/* Progress bar */}
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                <div
                  className="bg-indigo-600 h-4 rounded-full transition-all duration-1000"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>

              {/* Time adjustment controls */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => adjustTime(-60 * 5)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow text-sm"
                  title="Subtract 5 minutes"
                >
                  -5m
                </button>
                <button
                  onClick={() => adjustTime(-60)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow text-sm"
                  title="Subtract 1 minute"
                >
                  -1m
                </button>
                <button
                  onClick={() => adjustTime(60)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow text-sm"
                  title="Add 1 minute"
                >
                  +1m
                </button>
                <button
                  onClick={() => adjustTime(60 * 5)}
                  className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow text-sm"
                  title="Add 5 minutes"
                >
                  +5m
                </button>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-4 items-center">
              <div className="flex gap-4 justify-center">
                <button
                  onClick={togglePause}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
                <button
                  onClick={reset}
                  className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-200 shadow-lg"
                >
                  Reset
                </button>
              </div>

              <div className="flex flex-col gap-3 items-center">
                {/* Add more cycles button - only show in Pomodoro mode */}
                {timerMode === "pomodoro" && (
                  <button
                    onClick={() => addMoreCycles(1)}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg transition-all duration-200 shadow"
                    title="Add one more Pomodoro cycle (25 min focus + 5 min break)"
                  >
                    + Add Pomodoro (25/5)
                  </button>
                )}

                <div className="flex gap-4 items-center">
                  {/* Mute all button */}
                  <button
                    onClick={() => {
                      setMuteAll(!muteAll);
                      // Cancel any currently speaking audio when toggling mute
                      if (!muteAll && 'speechSynthesis' in window) {
                        window.speechSynthesis.cancel();
                      }
                    }}
                    className={`${
                      muteAll
                        ? 'bg-gray-600 hover:bg-gray-700'
                        : 'bg-gray-500 hover:bg-gray-600'
                    } text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 shadow flex items-center gap-2`}
                    title={muteAll ? "Unmute all sounds" : "Mute all sounds"}
                  >
                    {muteAll ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6l4.72-4.72a.75.75 0 011.28.531V19.94a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.506-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.395C2.806 8.757 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                      </svg>
                    )}
                    <span className="text-sm">{muteAll ? 'Unmute' : 'Mute'}</span>
                  </button>

                  {/* Mute break toggle */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={muteBreak}
                      onChange={(e) => {
                        setMuteBreak(e.target.checked);
                        // Cancel any currently speaking audio when toggling mute
                        if (e.target.checked && 'speechSynthesis' in window) {
                          window.speechSynthesis.cancel();
                        }
                      }}
                      className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 dark:focus:ring-indigo-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Mute during breaks
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Session overview */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Sessions Progress
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessions.map((session, index) => {
                  const getSessionColor = () => {
                    if (index < currentSessionIndex) {
                      return "bg-gray-400 text-white";
                    }

                    if (index === currentSessionIndex) {
                      if (session.type === "focus") {
                        return "bg-green-500 text-white ring-4 ring-green-300";
                      } else {
                        return "bg-blue-500 text-white ring-4 ring-blue-300";
                      }
                    }

                    // Future sessions
                    if (session.type === "focus") {
                      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
                    } else {
                      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
                    }
                  };

                  const getSessionLabel = () => {
                    if (session.type === "focus") return "F";
                    if (session.type === "break") return "B";
                    return "?";
                  };

                  return (
                    <div
                      key={index}
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${getSessionColor()}`}
                    >
                      {getSessionLabel()}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

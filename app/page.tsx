"use client";

import { useState, useEffect, useRef } from "react";

type SessionType = "focus" | "break";
type SessionDuration = 25 | 30 | 55 | 60 | 85 | 90 | 120 | 145 | 180;
type TimerMode = "pomodoro" | "guided" | "custom";

interface PomodoroSession {
  type: SessionType;
  duration: number; // in seconds
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

// Tomato Icon Component
const TomatoIcon = ({ className = "" }: { className?: string }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Shadow / base */}
    <ellipse cx="12" cy="18" rx="6.5" ry="2.2" fill="rgba(0,0,0,0.08)" />

    {/* Tomato body */}
    <circle cx="12" cy="12" r="7" fill="#FF4B4B" />

    {/* Subtle highlight */}
    <ellipse
      cx="9"
      cy="10"
      rx="2.4"
      ry="1.6"
      fill="#FFFFFF"
      opacity="0.35"
    />

    {/* Stem base */}
    <circle cx="12" cy="7.4" r="2.1" fill="#2E7D32" />

    {/* Leafy top */}
    <path
      d="M12 5.3
         L10.7 6.5
         L9.1 6.1
         L9.6 7.7
         L8.5 9
         L10.2 9.1
         L11.1 10.6
         L12 9.2
         L12.9 10.6
         L13.8 9.1
         L15.5 9
         L14.4 7.7
         L14.9 6.1
         L13.3 6.5
         Z"
      fill="#388E3C"
    />

    {/* Tiny top highlight on stem */}
    <circle cx="11.3" cy="6.8" r="0.45" fill="#FFFFFF" opacity="0.6" />
  </svg>
);

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
  const [tickSound, setTickSound] = useState<string>('tick-tok-alternate.mp3');
  const [tickVolume, setTickVolume] = useState<number>(0.2);
  const [announcementVolume, setAnnouncementVolume] = useState<number>(1.0);
  const [showSettings, setShowSettings] = useState(false);
  const [customMinutes, setCustomMinutes] = useState<string>("");
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const tickAudioRef = useRef<HTMLAudioElement | null>(null);
  const tokAudioRef = useRef<HTMLAudioElement | null>(null);
  const useTickRef = useRef<boolean>(true); // For alternating tick/tok
  const lastMinuteAnnouncedRef = useRef<number>(-1);
  const muteAllRef = useRef<boolean>(false);
  const muteBreakRef = useRef<boolean>(false);
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
    muteBreakRef.current = muteBreak;
  }, [muteBreak]);

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
      const sessionColor = currentSession?.type === "focus" ? "#FFFFFF" : "#A5F3E3";

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
        const sessionColor = currentSession?.type === "focus" ? "#FFFFFF" : "#A5F3E3";

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

  // Close PiP when tab becomes visible
  useEffect(() => {
    if (!isRunning) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab is visible, close PiP
        closePiP();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning]);

  // Clean up PiP window when component unmounts
  useEffect(() => {
    return () => {
      closePiP();
    };
  }, []);

  // Generate sessions based on selected duration and mode
  const generateSessions = (totalMinutes: SessionDuration | number): PomodoroSession[] => {
    const sessionsList: PomodoroSession[] = [];

    if (timerMode === "custom") {
      // Custom mode - single focus session with no breaks
      sessionsList.push({ type: "focus", duration: totalMinutes * 60 });
    } else if (timerMode === "pomodoro") {
      // Calculate number of pomodoros based on conventional structure
      // 25min = 1 Pomodoro, 55min = 2 Pomodoros, 85min = 3 Pomodoros, 145min = 5 Pomodoros
      const pomodoros = Math.floor((totalMinutes + 5) / 30); // Calculate number of pomodoros
      for (let i = 0; i < pomodoros; i++) {
        sessionsList.push({ type: "focus", duration: FOCUS_DURATION });
        // Add break after focus, except for the last pomodoro
        if (i < pomodoros - 1) {
          sessionsList.push({ type: "break", duration: BREAK_DURATION });
        }
      }
    } else {
      // Guided Deep Work mode - settle-in and wrap-up periods around focus sessions
      if (totalMinutes === 30) {
        // 30 min: 3 settle-in, 25 focus, 2 wrap-up
        sessionsList.push({ type: "break", duration: 3 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 2 * 60 });
      } else if (totalMinutes === 60) {
        // 60 min: 5 settle-in, 25 focus, 5 break, 20 focus, 5 wrap-up
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

  // Start a custom duration session
  const startCustomSession = (minutes: number) => {
    const sessionsList = generateSessions(minutes);
    setSessions(sessionsList);
    setCurrentSessionIndex(0);
    setTimeRemaining(sessionsList[0].duration);
    setSelectedDuration(minutes as SessionDuration);
    setIsRunning(true);
    setIsPaused(false);
    lastMinuteAnnouncedRef.current = -1;

    // Initialize speech synthesis on user interaction (Chrome requirement)
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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

  // Speak text using audio files
  const speak = (text: string) => {
    // Check if all sound is muted
    if (muteAllRef.current) {
      return;
    }

    // Check if we should mute during break sessions
    const currentSession = sessions[currentSessionIndex];
    if (muteBreakRef.current && currentSession?.type === "break") {
      return;
    }

    let audioPath = '';

    // Ding sound for 5-minute intervals (> 25 minutes)
    if (text === 'ding') {
      audioPath = '/audio/effects/ding.mp3';
    }
    // Session type announcements (Focus, Break, Done)
    else if (text === "Focus.") {
      audioPath = '/audio/countdown/transitions/focus.mp3';
    } else if (text === "Break.") {
      audioPath = '/audio/countdown/transitions/break.mp3';
    } else if (text === "Done.") {
      audioPath = '/audio/countdown/transitions/done.mp3';
    }
    // Minute announcements (e.g., "25 minutes", "1 minute")
    else if (text.includes('minute')) {
      const minuteMatch = text.match(/(\d+)\s+minute/);
      if (minuteMatch) {
        const minutes = parseInt(minuteMatch[1]);
        // Format with leading zero (e.g., m01, m02, ..., m25)
        const paddedMinutes = minutes.toString().padStart(2, '0');
        audioPath = `/audio/countdown/minutes/m${paddedMinutes}.mp3`;
      }
    }
    // Seconds announcements (e.g., "50 seconds", "10 seconds")
    else if (text.includes('seconds')) {
      const secondMatch = text.match(/(\d+)\s+seconds/);
      if (secondMatch) {
        const seconds = parseInt(secondMatch[1]);
        // Format with leading zero (e.g., s10, s20, ..., s50)
        const paddedSeconds = seconds.toString().padStart(2, '0');
        audioPath = `/audio/countdown/seconds/s${paddedSeconds}.mp3`;
      }
    }
    // Single digit countdown (1-9)
    else if (/^\d$/.test(text)) {
      const digit = parseInt(text);
      // Format with leading zero (e.g., s01, s02, ..., s09)
      const paddedDigit = digit.toString().padStart(2, '0');
      audioPath = `/audio/countdown/seconds/s${paddedDigit}.mp3`;
    }

    // Play the audio file
    if (audioPath) {
      const audio = new Audio(audioPath);
      audio.volume = announcementVolume;
      audio.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
  };

  // Initialize dark mode and audio settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setIsDarkMode(savedDarkMode);
      if (savedDarkMode) {
        document.documentElement.classList.add('dark');
      }

      // Load audio settings
      const savedTickSound = localStorage.getItem('tickSound');
      if (savedTickSound) {
        setTickSound(savedTickSound);
      }

      const savedTickVolume = localStorage.getItem('tickVolume');
      if (savedTickVolume) {
        setTickVolume(parseFloat(savedTickVolume));
      }

      const savedAnnouncementVolume = localStorage.getItem('announcementVolume');
      if (savedAnnouncementVolume) {
        setAnnouncementVolume(parseFloat(savedAnnouncementVolume));
      }

      // Check if Document Picture-in-Picture API is supported
      setIsPiPSupported('documentPictureInPicture' in window);
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

  // Initialize Audio Context once
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Update tick audio when sound or volume changes
  useEffect(() => {
    if (typeof window !== 'undefined' && tickSound && tickVolume !== undefined) {
      // Handle alternating tick-tok sound
      if (tickSound === 'tick-tok-alternate.mp3') {
        // Initialize both tick and tok audio elements
        tickAudioRef.current = new Audio(`/audio/effects/tick1.mp3`);
        tickAudioRef.current.volume = tickVolume;
        tickAudioRef.current.preload = 'auto';

        tokAudioRef.current = new Audio(`/audio/effects/tok1.mp3`);
        tokAudioRef.current.volume = tickVolume;
        tokAudioRef.current.preload = 'auto';

        tickAudioRef.current.onerror = () => console.log('tick1.mp3 not found');
        tokAudioRef.current.onerror = () => console.log('tok1.mp3 not found');
      } else {
        // Initialize single tick audio element
        tickAudioRef.current = new Audio(`/audio/effects/${tickSound}`);
        tickAudioRef.current.volume = tickVolume;
        tickAudioRef.current.preload = 'auto';

        tickAudioRef.current.onerror = () => {
          console.log('Tick audio file not found');
        };

        // Clear tok audio if it exists
        tokAudioRef.current = null;
      }
    }
  }, [tickSound, tickVolume]);

  // Play tick sound using audio file
  const playTick = () => {
    if (!tickAudioRef.current) return;

    // Check if all sound is muted
    if (muteAllRef.current) {
      return;
    }

    // Check if we should mute during break sessions
    const currentSession = sessions[currentSessionIndex];
    if (muteBreakRef.current && currentSession?.type === "break") {
      return;
    }

    // Handle alternating tick-tok
    if (tokAudioRef.current) {
      // Alternate between tick and tok
      const audioToPlay = useTickRef.current ? tickAudioRef.current : tokAudioRef.current;
      audioToPlay.currentTime = 0;
      audioToPlay.play().catch(err => {
        console.log('Audio play failed:', err);
      });
      // Toggle for next time
      useTickRef.current = !useTickRef.current;
    } else {
      // Single tick sound
      tickAudioRef.current.currentTime = 0;
      tickAudioRef.current.play().catch(err => {
        console.log('Audio play failed:', err);
      });
    }
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
            // Greater than 1 minute
            if (secondsRemaining === 0 && lastMinuteAnnouncedRef.current !== minutesRemaining) {
              // For minutes > 25: play ding at 5-minute intervals
              if (minutesRemaining > 25 && minutesRemaining % 5 === 0) {
                speak('ding');
              }
              // For minutes 1-25: announce the minute
              else if (minutesRemaining <= 25) {
                speak(`${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
              }
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      {/* Back button - top left, only shown when timer is running */}
      {selectedDuration && (
        <div className="fixed top-4 left-4 z-40">
          <button
            onClick={reset}
            className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
            title="Back to timer selection"
            aria-label="Back to timer selection"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
        </div>
      )}

      {/* Top right buttons */}
      <div className="fixed top-4 right-4 flex gap-3 z-40">
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
          title="Settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleDarkMode}
          className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
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
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={() => setShowSettings(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 border border-slate-200 dark:border-slate-700 animate-scaleIn max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

                {/* Second Sound Selection */}
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

                {/* Second Volume Slider */}
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
      )}

      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-slate-800 dark:text-white drop-shadow-lg dark:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-500">
          Flowmate
        </h1>
        <p className="text-center text-slate-600 dark:text-cyan-200/80 mb-8 text-base">
          Focus Timer with Audio Announcements
        </p>

        {!selectedDuration ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl pt-10 px-10 pb-8 border border-white/20 dark:border-cyan-500/20">
            {/* Tab Navigation */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-2xl border-2 border-slate-300 dark:border-cyan-500/40 p-1.5 bg-slate-100 dark:bg-slate-900/70 backdrop-blur-sm">
                <button
                  onClick={() => setTimerMode("pomodoro")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                    timerMode === "pomodoro"
                      ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                  }`}
                >
                  Pomodoro
                </button>
                <button
                  onClick={() => setTimerMode("guided")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                    timerMode === "guided"
                      ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                  }`}
                >
                  Guided Deep Work
                </button>
                <button
                  onClick={() => setTimerMode("custom")}
                  className={`px-6 py-3 rounded-xl transition-all duration-300 ${
                    timerMode === "custom"
                      ? "bg-white dark:bg-cyan-500/30 text-blue-700 dark:text-cyan-300 shadow-lg dark:shadow-cyan-500/30 font-bold scale-105"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-semibold"
                  }`}
                >
                  Custom
                </button>
              </div>
            </div>

            <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800 dark:text-white">
              {timerMode === "custom" ? "Custom Timer" : "Select Session Duration"}
            </h2>

            {timerMode === "custom" ? (
              <div className="space-y-6">
                {/* Custom time input */}
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full max-w-sm">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">
                      Enter minutes
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="999"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && customMinutes && parseInt(customMinutes) > 0) {
                          startCustomSession(parseInt(customMinutes));
                        }
                      }}
                      placeholder="e.g., 15, 45, 120"
                      className="w-full px-6 py-4 text-2xl text-center bg-slate-50 dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-600 rounded-2xl text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 dark:focus:ring-cyan-500 focus:border-transparent transition-all duration-200 font-mono"
                    />
                    <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                      </svg>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Voice announcements begin at 25 minutes
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (customMinutes && parseInt(customMinutes) > 0) {
                        startCustomSession(parseInt(customMinutes));
                      }
                    }}
                    disabled={!customMinutes || parseInt(customMinutes) <= 0}
                    className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold py-4 px-12 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-500 dark:disabled:hover:bg-cyan-500"
                  >
                    Start Timer
                  </button>
                </div>

                {/* Quick presets */}
                <div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center mb-3">Quick presets:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[15, 30, 45].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => startCustomSession(preset)}
                        className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 hover:scale-105"
                      >
                        {preset} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {(timerMode === "pomodoro"
                  ? [25, 55, 85, 145]
                  : [30, 60, 90, 120, 180]
                ).map((duration, index) => {
                  // Calculate pomodoro count for display
                  const pomodoroCount = timerMode === "pomodoro"
                    ? Math.floor((duration + 5) / 30)
                    : 0;

                  // Color progression for visual distinction
                  const colors = timerMode === "pomodoro"
                    ? [
                        "bg-blue-400 hover:bg-blue-500 dark:bg-cyan-400 dark:hover:bg-cyan-500",
                        "bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600",
                        "bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700",
                        "bg-blue-700 hover:bg-blue-800 dark:bg-cyan-700 dark:hover:bg-cyan-800"
                      ]
                    : [
                        "bg-blue-400 hover:bg-blue-500 dark:bg-cyan-400 dark:hover:bg-cyan-500",
                        "bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-600",
                        "bg-blue-600 hover:bg-blue-700 dark:bg-cyan-600 dark:hover:bg-cyan-700",
                        "bg-blue-700 hover:bg-blue-800 dark:bg-cyan-700 dark:hover:bg-cyan-800",
                        "bg-blue-800 hover:bg-blue-900 dark:bg-cyan-800 dark:hover:bg-cyan-900"
                      ];

                  // Taglines for context
                  const taglines = timerMode === "pomodoro"
                    ? [
                        "Classic focus session",
                        "Two rounds back-to-back",
                        "Deep flow block",
                        "Extended deep work"
                      ]
                    : [
                        "Quick guided session",
                        "Standard deep work",
                        "Extended focus time",
                        "Long work session",
                        "Marathon focus"
                      ];

                  return (
                    <button
                      key={duration}
                      onClick={() => startSession(duration as SessionDuration)}
                      className={`${colors[index]} text-white font-bold py-6 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 hover:shadow-xl`}
                      style={{ boxShadow: '0px 8px 24px rgba(0,0,0,0.12)' }}
                    >
                      {timerMode === "pomodoro" && (
                        <div className="flex items-center justify-center gap-1.5 mb-2 mt-1">
                          {Array.from({ length: pomodoroCount }).map((_, i) => (
                            <TomatoIcon key={i} className="drop-shadow-sm" />
                          ))}
                        </div>
                      )}
                      <div className="text-4xl mb-2">{duration} min</div>
                      <div className="text-xs opacity-75 mt-1">
                        {taglines[index]}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/20 dark:border-cyan-500/20">
            {/* Current session info */}
            <div className="text-center mb-8">
              <div className={`inline-block px-8 py-3 rounded-2xl text-white font-bold text-lg shadow-lg transition-all duration-300 ${
                sessions[currentSessionIndex]?.type === "focus"
                  ? "bg-blue-500 dark:bg-cyan-500 dark:shadow-cyan-500/50"
                  : "bg-slate-500 dark:bg-slate-600"
              }`}>
                {sessions[currentSessionIndex]?.type === "focus" && (timerMode === "custom" ? "⏱️ Custom Timer" : "🎯 Focus Time")}
                {sessions[currentSessionIndex]?.type === "break" && "☕ Break Time"}
              </div>
              {sessions.length > 1 && (
                <div className="text-sm text-slate-600 dark:text-slate-300 mt-3 font-medium">
                  Session {currentSessionIndex + 1} of {sessions.length}
                </div>
              )}
            </div>

            {/* Timer display */}
            <div className="text-center mb-8">
              <div className={`text-9xl font-bold mb-4 font-mono transition-all duration-300 ${
                sessions[currentSessionIndex]?.type === "focus"
                  ? "text-slate-800 dark:text-white dark:drop-shadow-[0_0_30px_rgba(34,211,238,0.6)]"
                  : "text-[#2FC6A5] dark:text-[#2FC6A5] drop-shadow-[0_0_30px_rgba(47,198,165,0.5)]"
              }`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Time adjustment controls - below timer */}
              <div className="flex gap-2 justify-center mb-4">
                <button
                  onClick={() => adjustTime(-60 * 5)}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
                  title="Subtract 5 minutes"
                  aria-label="Subtract 5 minutes"
                >
                  -5m
                </button>
                <button
                  onClick={() => adjustTime(-60)}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
                  title="Subtract 1 minute"
                  aria-label="Subtract 1 minute"
                >
                  -1m
                </button>
                <button
                  onClick={() => adjustTime(60)}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
                  title="Add 1 minute"
                  aria-label="Add 1 minute"
                >
                  +1m
                </button>
                <button
                  onClick={() => adjustTime(60 * 5)}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-medium py-1.5 px-3 rounded-lg transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600 text-xs"
                  title="Add 5 minutes"
                  aria-label="Add 5 minutes"
                >
                  +5m
                </button>
              </div>

              {/* Segmented Progress bar */}
              <div className="w-full flex gap-1 mb-4 py-2">
                {sessions.map((session, index) => {
                  const totalDuration = sessions.reduce((sum, s) => sum + s.duration, 0);
                  const sessionPercentage = (session.duration / totalDuration) * 100;

                  // Calculate fill percentage for this segment
                  let fillPercentage = 0;
                  if (index < currentSessionIndex) {
                    // Completed sessions are 100% filled
                    fillPercentage = 100;
                  } else if (index === currentSessionIndex) {
                    // Current session shows progress
                    const sessionProgress = ((session.duration - timeRemaining) / session.duration) * 100;
                    fillPercentage = Math.max(0, Math.min(100, sessionProgress));
                  }
                  // Future sessions remain at 0%

                  const isFocus = session.type === "focus";
                  const isFirstSegment = index === 0;
                  const isLastSegment = index === sessions.length - 1;

                  // Determine border radius classes
                  let borderRadiusClass = '';
                  if (isFirstSegment && isLastSegment) {
                    borderRadiusClass = 'rounded-full';
                  } else if (isFirstSegment) {
                    borderRadiusClass = 'rounded-l-full';
                  } else if (isLastSegment) {
                    borderRadiusClass = 'rounded-r-full';
                  }

                  // Format duration for tooltip
                  const durationMinutes = Math.floor(session.duration / 60);
                  const tooltipText = `${durationMinutes}m ${isFocus ? 'Focus' : 'Break'}`;

                  return (
                    <div
                      key={index}
                      style={{ flex: `${sessionPercentage} 1 0%` }}
                      className={`relative h-4 overflow-hidden ${borderRadiusClass} cursor-pointer`}
                      title={tooltipText}
                    >
                      {/* Background (unfilled) */}
                      <div className={`absolute inset-0 pointer-events-none ${
                        isFocus
                          ? 'bg-[rgb(210,221,236)] dark:bg-slate-700/50'
                          : 'bg-[rgb(81,94,168)] dark:bg-slate-600/50'
                      }`}></div>

                      {/* Progress fill */}
                      <div
                        className={`absolute inset-0 transition-all duration-1000 pointer-events-none ${
                          isFocus
                            ? 'bg-[rgb(165,243,227)] dark:bg-cyan-400'
                            : 'bg-[rgb(115,122,201)] dark:bg-slate-500'
                        }`}
                        style={{ width: `${fillPercentage}%` }}
                      ></div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col gap-5 items-center">
              {/* Primary Controls - Pause Button */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={togglePause}
                  className="bg-blue-500 hover:bg-blue-600 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white font-bold p-4 rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl"
                  aria-label={isPaused ? "Resume timer" : "Pause timer"}
                  title={isPaused ? "Resume Timer" : "Pause Timer"}
                >
                  {isPaused ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                      <path fillRule="evenodd" d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Secondary Controls Row */}
              <div className="flex flex-wrap gap-2 items-center justify-center text-sm">
                {/* Add more cycles - Pomodoro only */}
                {timerMode === "pomodoro" && (
                  <button
                    onClick={() => addMoreCycles(1)}
                    className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium py-2 px-3 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                    title="Add Pomodoro Cycle"
                    aria-label="Add Pomodoro cycle"
                  >
                    + Pomodoro
                  </button>
                )}

                {/* Mute all button - Icon only */}
                <button
                  onClick={() => {
                    setMuteAll(!muteAll);
                    if (!muteAll && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                  title={muteAll ? "Unmute All Sounds" : "Mute All Sounds"}
                  aria-label={muteAll ? "Unmute all sounds" : "Mute all sounds"}
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
                </button>

                {/* Mute breaks button - Icon only */}
                <button
                  onClick={() => {
                    setMuteBreak(!muteBreak);
                    if (!muteBreak && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                  }}
                  className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                  title={muteBreak ? "Unmute During Breaks" : "Mute During Breaks"}
                  aria-label={muteBreak ? "Unmute during breaks" : "Mute during breaks"}
                >
                  {muteBreak ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  )}
                </button>

                {/* PiP button - only show if supported */}
                {isPiPSupported && (
                  <button
                    onClick={openPiP}
                    className="bg-white/60 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium p-2 rounded-xl transition-all duration-200 backdrop-blur-sm border border-slate-200 dark:border-slate-600"
                    title="Picture-in-Picture Mode"
                    aria-label="Open picture-in-picture mode"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

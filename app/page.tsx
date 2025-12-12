"use client";

import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { SessionDuration, TimerMode, PomodoroSession, FOCUS_DURATION, BREAK_DURATION } from "./types";
import { SettingsModal } from "./components/SettingsModal";
import { TimerSelection } from "./components/TimerSelection";
import { TimerDisplay } from "./components/TimerDisplay";
import { CompletionScreen } from "./components/CompletionScreen";
import { MobileNotification } from "./components/MobileNotification";

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
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
  const endTimeRef = useRef<number>(0);

  // Update refs for PiP
  useEffect(() => {
    isPausedRef.current = isPaused;
    timeRemainingRef.current = timeRemaining;
    currentSessionIndexRef.current = currentSessionIndex;
    sessionsRef.current = sessions;
    muteAllRef.current = muteAll;
    muteBreakRef.current = muteBreak;
  }, [isPaused, timeRemaining, currentSessionIndex, sessions, muteAll, muteBreak]);

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
        // Add break before focus (except for the first pomodoro if you want to start with focus)
        if (i > 0) {
          sessionsList.push({ type: "break", duration: BREAK_DURATION });
        }
        sessionsList.push({ type: "focus", duration: FOCUS_DURATION });
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
      } else if (totalMinutes === 90) {
        // 90 min: 5 break, 25 focus, 5 break, 25 focus, 5 break, 20 focus, 5 break
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 20 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
      } else if (totalMinutes === 120) {
        // 120 min: 5 break, 25 focus, 5 break, 25 focus, 5 break, 25 focus, 5 break, 20 focus, 5 break
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 20 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
      } else if (totalMinutes === 180) {
        // 180 min: 5 break, then five 25-min focus sessions with breaks, then one 20-min focus, then final break
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 25 * 60 });
        sessionsList.push({ type: "break", duration: 5 * 60 });
        sessionsList.push({ type: "focus", duration: 20 * 60 });
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

    // Initialize audio on user interaction (required for mobile browsers)
    initializeAudio();
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

    // Initialize audio on user interaction (required for mobile browsers)
    initializeAudio();
  };

  // Reset everything
  const reset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setSelectedDuration(null);
    setSessions([]);
    setCurrentSessionIndex(0);
    setTimeRemaining(0);
    setIsCompleted(false);
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
      // Update the end time reference to reflect the adjustment
      endTimeRef.current = Date.now() + newTime * 1000;
      // Reset announcement tracking when time is adjusted
      lastMinuteAnnouncedRef.current = -1;
      return newTime;
    });
  };

  // Add more Pomodoro cycles (5 min break + 25 min focus)
  const addMoreCycles = (numCycles: number = 1) => {
    const newSessions: PomodoroSession[] = [];
    for (let i = 0; i < numCycles; i++) {
      newSessions.push({ type: "break", duration: BREAK_DURATION });
      newSessions.push({ type: "focus", duration: FOCUS_DURATION });
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

      // Detect mobile devices first
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(isMobileDevice);

      // Load audio settings
      const savedTickSound = localStorage.getItem('tickSound');
      if (savedTickSound) {
        setTickSound(savedTickSound);
      }

      const savedTickVolume = localStorage.getItem('tickVolume');
      if (savedTickVolume && !isMobileDevice) {
        // Don't load tick volume on mobile - keep it at 0
        setTickVolume(parseFloat(savedTickVolume));
      } else if (isMobileDevice) {
        // Force tick volume to 0 on mobile
        setTickVolume(0);
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

  // Initialize audio elements (prepare but don't load yet to avoid autoplay issues)
  const initializeAudio = () => {
    if (typeof window !== 'undefined' && tickSound && tickVolume !== undefined) {
      // Handle alternating tick-tok sound
      if (tickSound === 'tick-tok-alternate.mp3') {
        // Initialize both tick and tok audio elements
        if (!tickAudioRef.current) {
          tickAudioRef.current = new Audio(`/audio/effects/tick1.mp3`);
          tickAudioRef.current.onerror = () => console.log('tick1.mp3 not found');
        }
        tickAudioRef.current.volume = tickVolume;

        if (!tokAudioRef.current) {
          tokAudioRef.current = new Audio(`/audio/effects/tok1.mp3`);
          tokAudioRef.current.onerror = () => console.log('tok1.mp3 not found');
        }
        tokAudioRef.current.volume = tickVolume;
      } else {
        // Initialize single tick audio element
        if (!tickAudioRef.current || tickAudioRef.current.src !== `/audio/effects/${tickSound}`) {
          tickAudioRef.current = new Audio(`/audio/effects/${tickSound}`);
          tickAudioRef.current.onerror = () => {
            console.log('Tick audio file not found');
          };
        }
        tickAudioRef.current.volume = tickVolume;

        // Clear tok audio if it exists
        tokAudioRef.current = null;
      }
    }
  };

  // Update tick audio when sound or volume changes
  useEffect(() => {
    initializeAudio();
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

  // Main timer effect - using timestamp-based approach to avoid browser throttling
  useEffect(() => {
    if (!isRunning || isPaused || sessions.length === 0) return;

    // Set the end time based on current time remaining
    endTimeRef.current = Date.now() + timeRemaining * 1000;
    let lastSecond = timeRemaining;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTimeRef.current - now) / 1000));

      // Update time remaining
      setTimeRemaining(remaining);

      // Play tick sound when second changes (non-blocking)
      if (remaining !== lastSecond && remaining > 0) {
        try {
          playTick();
        } catch (err) {
          // Silently catch any audio errors to prevent timer from stopping
        }
      }
      lastSecond = remaining;

      // Announce remaining time
      if (remaining > 0) {
        const minutesRemaining = Math.floor(remaining / 60);
        const secondsRemaining = remaining % 60;

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
          if (remaining >= 10) {
            // Between 10-59 seconds: announce every 10 seconds (50, 40, 30, 20, 10)
            if (remaining % 10 === 0 && lastMinuteAnnouncedRef.current !== remaining) {
              speak(`${remaining} seconds`);
              lastMinuteAnnouncedRef.current = remaining;
            }
          } else {
            // Less than 10 seconds: countdown 9, 8, 7, 6, 5, 4, 3, 2, 1
            if (lastMinuteAnnouncedRef.current !== remaining) {
              speak(`${remaining}`);
              lastMinuteAnnouncedRef.current = remaining;
            }
          }
        }
      }

      // Session complete
      if (remaining <= 0) {
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
          setTimeRemaining(sessions[nextIndex].duration);
          lastMinuteAnnouncedRef.current = -1;
          endTimeRef.current = Date.now() + sessions[nextIndex].duration * 1000;
        } else {
          // All sessions complete
          speak("Done.");
          setIsRunning(false);
          setIsCompleted(true);

          // Trigger confetti celebration
          const duration = 3000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

          function randomInRange(min: number, max: number) {
            return Math.random() * (max - min) + min;
          }

          const confettiInterval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
              return clearInterval(confettiInterval);
            }

            const particleCount = 50 * (timeLeft / duration);

            // Fire confetti from both sides
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
              ...defaults,
              particleCount,
              origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
          }, 250);
        }
      }
    }, 100); // Check every 100ms for accuracy

    return () => clearInterval(interval);
  }, [isRunning, isPaused, currentSessionIndex, sessions]);

  // Update page title with session type (without countdown to avoid browser throttling issues)
  useEffect(() => {
    if (isRunning) {
      const currentSession = sessions[currentSessionIndex];
      if (currentSession?.type === "focus") {
        document.title = "🎯 Focus Time - Flowmate";
      } else if (currentSession?.type === "break") {
        document.title = "☕ Break Time - Flowmate";
      }
    } else if (isCompleted) {
      document.title = "✅ Done! - Flowmate";
    } else {
      document.title = "Flowmate - Focus Timer";
    }
  }, [isRunning, isCompleted, sessions, currentSessionIndex]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-[#E0F2FE] via-[#EEF2FF] to-[#93C5FD] dark:from-[#0F172A] dark:via-[#1E293B] dark:to-[#0F172A] transition-colors duration-500">
      {/* Mobile notification banner */}
      {isMobile && <MobileNotification />}

      {/* Back button - top left, only shown when timer is running */}
      {selectedDuration && (
        <div className={`fixed left-2 sm:left-4 z-40 ${isMobile ? 'top-12' : 'top-2 sm:top-4'}`}>
          <button
            onClick={reset}
            className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
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
      <div className={`fixed right-2 sm:right-4 flex gap-2 sm:gap-3 z-40 ${isMobile ? 'top-12' : 'top-2 sm:top-4'}`}>
        {/* Settings button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
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
          className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 text-slate-700 dark:text-cyan-400 border border-white/20 dark:border-cyan-500/30"
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
      <SettingsModal
        showSettings={showSettings}
        setShowSettings={setShowSettings}
        tickSound={tickSound}
        setTickSound={setTickSound}
        tickVolume={tickVolume}
        setTickVolume={setTickVolume}
        announcementVolume={announcementVolume}
        setAnnouncementVolume={setAnnouncementVolume}
        muteBreak={muteBreak}
        setMuteBreak={setMuteBreak}
        isMobile={isMobile}
      />

      <div className="w-full max-w-2xl px-2 sm:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-2 text-slate-800 dark:text-white drop-shadow-lg dark:drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all duration-500">
          Flowmate
        </h1>
        <p className="text-center text-slate-600 dark:text-cyan-200/80 mb-6 sm:mb-8 text-sm sm:text-base">
          Focus Timer with Audio Announcements
        </p>

        {!selectedDuration ? (
          <TimerSelection
            timerMode={timerMode}
            setTimerMode={setTimerMode}
            customMinutes={customMinutes}
            setCustomMinutes={setCustomMinutes}
            startSession={startSession}
            startCustomSession={startCustomSession}
          />
        ) : isCompleted ? (
          <CompletionScreen
            timerMode={timerMode}
            selectedDuration={selectedDuration}
            reset={reset}
          />
        ) : (
          <TimerDisplay
            sessions={sessions}
            currentSessionIndex={currentSessionIndex}
            timerMode={timerMode}
            timeRemaining={timeRemaining}
            formatTime={formatTime}
            adjustTime={adjustTime}
            isPaused={isPaused}
            togglePause={togglePause}
            addMoreCycles={addMoreCycles}
            muteAll={muteAll}
            setMuteAll={setMuteAll}
            muteBreak={muteBreak}
            setMuteBreak={setMuteBreak}
            isPiPSupported={isPiPSupported}
            openPiP={openPiP}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="mt-8 sm:mt-12 pb-4 text-center text-xs sm:text-sm text-slate-600 dark:text-cyan-200/60 transition-colors duration-500">
        Made by Liddy 🦥💻✨ • Lydia Studio
        <br />
        💬 <a href="https://forms.gle/TnjJTJqjMrAg45Jr9" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-cyan-300 underline transition-colors">Share feedback</a> • 🍵 <a href="https://buymeacoffee.com/lydiastudio" target="_blank" rel="noopener noreferrer" className="hover:text-slate-800 dark:hover:text-cyan-300 underline transition-colors">Find this useful? Buy me a matcha latte</a>
      </footer>
    </main>
  );
}

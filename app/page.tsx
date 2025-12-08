"use client";

import { useState, useEffect, useRef } from "react";

type SessionType = "focus" | "break";
type SessionDuration = 30 | 60 | 90 | 180;

interface PomodoroSession {
  type: SessionType;
  duration: number; // in seconds
}

const FOCUS_DURATION = 25 * 60; // 25 minutes in seconds
const BREAK_DURATION = 5 * 60; // 5 minutes in seconds

export default function Home() {
  const [selectedDuration, setSelectedDuration] = useState<SessionDuration | null>(null);
  const [sessions, setSessions] = useState<PomodoroSession[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const lastMinuteAnnouncedRef = useRef<number>(-1);

  // Generate sessions based on selected duration
  const generateSessions = (totalMinutes: SessionDuration): PomodoroSession[] => {
    const cycles = totalMinutes / 30; // Each cycle is 30 minutes (25 focus + 5 break)
    const sessionsList: PomodoroSession[] = [];

    for (let i = 0; i < cycles; i++) {
      sessionsList.push({ type: "focus", duration: FOCUS_DURATION });
      sessionsList.push({ type: "break", duration: BREAK_DURATION });
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

  // Speak text using Web Speech API
  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Initialize Audio Context
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }, []);

  // Play tick sound using Web Audio API
  const playTick = () => {
    if (!audioContextRef.current) return;

    const audioContext = audioContextRef.current;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Create a subtle, gentle tick sound
    oscillator.frequency.value = 850; // Lower frequency (was 1000Hz)
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime); // Lower volume (was 0.3)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.02); // Shorter duration (was 0.05)

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.02);
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
              speak(`T-${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`);
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
          speak(`${currentSession.type === "focus" ? "Focus" : "Break"} session complete`);

          // Move to next session
          const nextIndex = currentSessionIndex + 1;
          if (nextIndex < sessions.length) {
            setCurrentSessionIndex(nextIndex);
            lastMinuteAnnouncedRef.current = -1;
            return sessions[nextIndex].duration;
          } else {
            // All sessions complete
            speak("All sessions complete. Great work!");
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
      <div className="w-full max-w-2xl">
        <h1 className="text-5xl font-bold text-center mb-2 text-gray-800 dark:text-white">
          Flowmate
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mb-12">
          Pomodoro Timer with Audio Announcements
        </p>

        {!selectedDuration ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-semibold mb-6 text-center text-gray-800 dark:text-white">
              Select Session Duration
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[30, 60, 90, 180].map((duration) => (
                <button
                  key={duration}
                  onClick={() => startSession(duration as SessionDuration)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-6 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <div className="text-3xl mb-2">{duration} min</div>
                  <div className="text-sm opacity-90">
                    {duration / 30}x Pomodoro
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
                {sessions[currentSessionIndex]?.type === "focus" ? "Focus Time" : "Break Time"}
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
            </div>

            {/* Controls */}
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

            {/* Session overview */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
                Sessions Progress
              </h3>
              <div className="flex flex-wrap gap-2">
                {sessions.map((session, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 rounded-lg flex items-center justify-center text-xs font-bold ${
                      index < currentSessionIndex
                        ? "bg-gray-400 text-white"
                        : index === currentSessionIndex
                        ? session.type === "focus"
                          ? "bg-green-500 text-white ring-4 ring-green-300"
                          : "bg-blue-500 text-white ring-4 ring-blue-300"
                        : session.type === "focus"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    }`}
                  >
                    {session.type === "focus" ? "F" : "B"}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

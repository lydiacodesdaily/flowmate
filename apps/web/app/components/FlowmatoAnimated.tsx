"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

// Shared spring config — used everywhere for a consistent feel
const spring = { type: "spring", stiffness: 280, damping: 22 } as const;

// Cubic-bezier overshoot for celebration — mimics a spring bounce without
// needing 3 keyframes (which Framer Motion's spring engine doesn't support)
const celebrationTransition = {
  type: "tween",
  duration: 0.5,
  ease: [0.34, 1.56, 0.64, 1],
} as const;

const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = [
  "#f87171", "#fb923c", "#facc15", "#4ade80",
  "#34d399", "#38bdf8", "#818cf8", "#f472b6",
];

function srcToStage(src: string): number {
  if (src.includes("1_seedling")) return 1;
  if (src.includes("2_plant")) return 2;
  if (src.includes("3_small")) return 3;
  if (src.includes("4_medium")) return 4;
  if (src.includes("5_full")) return 5;
  if (src.includes("6_happy")) return 6;
  return 0; // break / daydreaming / unknown
}

interface FlowmatoAnimatedProps {
  src: string;
  label: string;
  isPaused: boolean;
  currentSessionType: string | undefined;
}

export const FlowmatoAnimated = ({
  src,
  label,
  isPaused,
  currentSessionType,
}: FlowmatoAnimatedProps) => {
  // Component is remounted via key={currentSessionIndex} in TimerDisplay,
  // so all state/refs are fresh at the start of each session.
  const rawStage = srcToStage(src);

  // If we mount at stage 6, sessions haven't loaded yet (timeRemaining=0 makes
  // pct=1.0). Show seedling visually, but initialize maxStageRef to 6 so the
  // advance effect never fires upward from 0 and overwrites it.
  const maxStageRef = useRef<number>(rawStage);
  const prevStageRef = useRef<number>(rawStage);

  // displaySrc only ever advances — prevents regression when adding time
  const [displaySrc, setDisplaySrc] = useState(
    rawStage === 6 ? '/flowmato/progress/1_seedling.png' : src
  );
  const [showGrowPop, setShowGrowPop] = useState(false);
  const [growPopKey, setGrowPopKey] = useState(0);
  const [isCelebrating, setIsCelebrating] = useState(false);

  const isFloating = !isPaused && currentSessionType === "focus";

  // Advance displaySrc when stage grows; allow break/daydream to show immediately.
  // Also handles new session start: if stage drops from 6 → 1, that means the
  // real timer just began (sessions were empty on mount, now they're loaded).
  useEffect(() => {
    if (rawStage > maxStageRef.current) {
      maxStageRef.current = rawStage;
      setDisplaySrc(src);
    } else if (rawStage === 0) {
      maxStageRef.current = 0;
      setDisplaySrc(src);
    } else if (rawStage === 1 && maxStageRef.current === 6) {
      // Stage dropped from 6 → 1: timer just started after mount with empty sessions
      maxStageRef.current = 1;
      setDisplaySrc(src);
    }
  }, [src, rawStage]);

  // Detect stage increments → "+growing!" pop + celebration
  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = rawStage;
    if (rawStage > prev && rawStage > 0) {
      setShowGrowPop(true);
      setGrowPopKey((k) => k + 1);
      const t = setTimeout(() => setShowGrowPop(false), 1000);

      if (rawStage === 6) {
        setIsCelebrating(true);
        const tc = setTimeout(() => setIsCelebrating(false), 1500);
        return () => { clearTimeout(t); clearTimeout(tc); };
      }
      return () => clearTimeout(t);
    }
  }, [rawStage]);

  const floatTransition = isFloating
    ? { y: { repeat: Infinity, duration: 2.8, ease: "easeInOut" as const } }
    : { ...spring };

  const particles = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
    const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
    return {
      x: Math.cos(angle) * 44,
      y: Math.sin(angle) * 44,
      color: PARTICLE_COLORS[i],
    };
  });

  const isCelebrationEntry = rawStage === 6 && isCelebrating;

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">

        {/* Idle float wrapper */}
        <motion.div
          animate={{ y: isFloating ? [0, -7, 0] : 0 }}
          transition={floatTransition}
          className="w-full h-full flex items-center justify-center"
        >
          {/* AnimatePresence: crossfade between image stages */}
          <AnimatePresence mode="popLayout">
            <motion.img
              key={displaySrc}
              src={displaySrc}
              alt="Flowmato"
              className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-md"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.18 } }}
              transition={isCelebrationEntry ? celebrationTransition : spring}
            />
          </AnimatePresence>
        </motion.div>

        {/* "+growing!" score pop */}
        <AnimatePresence>
          {showGrowPop && (
            <motion.span
              key={growPopKey}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -32 }}
              exit={{}}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute top-0 left-1/2 -translate-x-1/2 text-xs font-bold text-green-500 dark:text-green-400 pointer-events-none select-none whitespace-nowrap"
            >
              +growing!
            </motion.span>
          )}
        </AnimatePresence>

        {/* Celebration particles */}
        <AnimatePresence>
          {isCelebrating &&
            particles.map((p, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full pointer-events-none"
                style={{
                  backgroundColor: p.color,
                  top: "50%",
                  left: "50%",
                  marginTop: -4,
                  marginLeft: -4,
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0 }}
                exit={{}}
                transition={{
                  ...spring,
                  delay: i * 0.04,
                  opacity: { duration: 0.6, delay: i * 0.04 },
                }}
              />
            ))}
        </AnimatePresence>
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{label}</p>
    </div>
  );
};

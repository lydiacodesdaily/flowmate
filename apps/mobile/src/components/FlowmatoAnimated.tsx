import React, { useEffect, useRef, useState } from 'react';
import { Animated, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import type { SessionType } from '@flowmate/shared';

const PARTICLE_COUNT = 8;
const PARTICLE_COLORS = [
  '#f87171', '#fb923c', '#facc15', '#4ade80',
  '#34d399', '#38bdf8', '#818cf8', '#f472b6',
];

function srcToStage(src: ImageSourcePropType): number {
  // Use the numeric asset id from require() to map to a stage.
  // We compare by reference — each require() call in getFlowmatoImageSrc returns
  // the same cached module id for the same file, so this is stable.
  const s = src as number;
  if (s === STAGE_REFS[1]) return 1;
  if (s === STAGE_REFS[2]) return 2;
  if (s === STAGE_REFS[3]) return 3;
  if (s === STAGE_REFS[4]) return 4;
  if (s === STAGE_REFS[5]) return 5;
  if (s === STAGE_REFS[6]) return 6;
  return 0; // break / daydream / unknown
}

// Eagerly resolve all require()s so srcToStage can compare by id
const STAGE_REFS: Record<number, number> = {
  1: require('../../assets/flowmato/progress/1_seedling.png') as number,
  2: require('../../assets/flowmato/progress/2_plant.png') as number,
  3: require('../../assets/flowmato/progress/3_small.png') as number,
  4: require('../../assets/flowmato/progress/4_medium.png') as number,
  5: require('../../assets/flowmato/progress/5_full.png') as number,
  6: require('../../assets/flowmato/progress/6_happy.png') as number,
};

interface FlowmatoAnimatedProps {
  imageSrc: ImageSourcePropType;
  label: string;
  isPaused?: boolean;
  currentSessionType?: SessionType;
  hideLabel?: boolean;
}

export function FlowmatoAnimated({
  imageSrc,
  label,
  hideLabel = false,
}: FlowmatoAnimatedProps) {
  const rawStage = srcToStage(imageSrc);
  const mountStage = rawStage === 6 ? 0 : rawStage;
  const maxStageRef = useRef<number>(mountStage);
  const prevStageRef = useRef<number>(mountStage);

  const [displaySrc, setDisplaySrc] = useState<ImageSourcePropType>(
    rawStage === 6
      ? (require('../../assets/flowmato/progress/1_seedling.png') as ImageSourcePropType)
      : imageSrc
  );
  const [isCelebrating, setIsCelebrating] = useState(false);

  // ── Stage image crossfade ────────────────────────────────────────────────
  const [prevDisplaySrc, setPrevDisplaySrc] = useState<ImageSourcePropType | null>(null);
  const crossfadeOpacity = useRef(new Animated.Value(0)).current; // opacity of incoming image

  const crossfade = (next: ImageSourcePropType) => {
    setPrevDisplaySrc(displaySrc);
    setDisplaySrc(next);
    crossfadeOpacity.setValue(0);
    Animated.timing(crossfadeOpacity, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start(() => setPrevDisplaySrc(null));
  };

  // Advance displaySrc when stage grows; allow break/daydream to show immediately
  useEffect(() => {
    if (rawStage > maxStageRef.current) {
      maxStageRef.current = rawStage;
      crossfade(imageSrc);
    } else if (rawStage === 0) {
      maxStageRef.current = 0;
      crossfade(imageSrc);
    }
  }, [imageSrc, rawStage]);

  // ── "+growing!" pop ──────────────────────────────────────────────────────
  const popOpacity = useRef(new Animated.Value(0)).current;
  const popY = useRef(new Animated.Value(0)).current;
  const [showGrowPop, setShowGrowPop] = useState(false);

  useEffect(() => {
    const prev = prevStageRef.current;
    prevStageRef.current = rawStage;
    if (rawStage > prev && rawStage > 0) {
      setShowGrowPop(true);
      popOpacity.setValue(1);
      popY.setValue(0);
      Animated.parallel([
        Animated.timing(popOpacity, { toValue: 0, duration: 850, useNativeDriver: true }),
        Animated.timing(popY, { toValue: -32, duration: 850, useNativeDriver: true }),
      ]).start(() => setShowGrowPop(false));

      if (rawStage === 6) {
        setIsCelebrating(true);
        const t = setTimeout(() => setIsCelebrating(false), 1500);
        return () => clearTimeout(t);
      }
    }
  }, [rawStage]);

  // ── Celebration particles ────────────────────────────────────────────────
  const particleAnims = useRef(
    Array.from({ length: PARTICLE_COUNT }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    if (!isCelebrating) return;
    particleAnims.forEach((p, i) => {
      p.x.setValue(0);
      p.y.setValue(0);
      p.opacity.setValue(1);
      p.scale.setValue(1);
      const angle = (i / PARTICLE_COUNT) * 2 * Math.PI;
      const tx = Math.cos(angle) * 44;
      const ty = Math.sin(angle) * 44;
      Animated.parallel([
        Animated.timing(p.x, { toValue: tx, duration: 600, delay: i * 40, useNativeDriver: true }),
        Animated.timing(p.y, { toValue: ty, duration: 600, delay: i * 40, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, duration: 600, delay: i * 40, useNativeDriver: true }),
        Animated.timing(p.scale, { toValue: 0, duration: 600, delay: i * 40, useNativeDriver: true }),
      ]).start();
    });
  }, [isCelebrating]);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.imageContainer}>
          {/* Outgoing image (fades out during crossfade) */}
          {prevDisplaySrc && (
            <Animated.Image
              source={prevDisplaySrc}
              style={[styles.image, { opacity: Animated.subtract(1, crossfadeOpacity) }]}
              resizeMode="contain"
            />
          )}
          {/* Current image */}
          <Animated.Image
            source={displaySrc}
            style={[
              styles.image,
              prevDisplaySrc ? { opacity: crossfadeOpacity } : { opacity: 1 },
            ]}
            resizeMode="contain"
          />
        </View>

        {/* "+growing!" pop */}
        {showGrowPop && (
          <Animated.Text
            style={[
              styles.growPop,
              { opacity: popOpacity, transform: [{ translateY: popY }] },
            ]}
          >
            +growing!
          </Animated.Text>
        )}

        {/* Celebration particles */}
        {isCelebrating &&
          particleAnims.map((p, i) => (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: PARTICLE_COLORS[i],
                  opacity: p.opacity,
                  transform: [
                    { translateX: p.x },
                    { translateY: p.y },
                    { scale: p.scale },
                  ],
                },
              ]}
            />
          ))}
      </View>

      {!hideLabel && <Text allowFontScaling={false} style={styles.label}>{label}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    alignSelf: 'stretch',
  },
  container: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageContainer: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 80,
    height: 80,
    position: 'absolute',
  },
  growPop: {
    position: 'absolute',
    top: 0,
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4ade80',
  },
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    top: '50%',
    left: '50%',
    marginTop: -4,
    marginLeft: -4,
  },
  label: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
  },
});

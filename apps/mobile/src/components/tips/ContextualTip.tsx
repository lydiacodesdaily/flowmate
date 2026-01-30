import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme';
import { useAccessibility } from '../../contexts';
import { hasSeenTip, markTipSeen, TipId } from '../../utils/storage';

interface ContextualTipProps {
  tipId: TipId;
  message: string;
  /** Position relative to the triggering element */
  position?: 'top' | 'bottom';
  /** Called when tip is dismissed */
  onDismiss?: () => void;
}

export function ContextualTip({
  tipId,
  message,
  position = 'bottom',
  onDismiss,
}: ContextualTipProps) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { reduceMotion } = useAccessibility();
  const [visible, setVisible] = useState(false);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === 'top' ? -10 : 10)).current;

  useEffect(() => {
    let mounted = true;

    hasSeenTip(tipId).then(seen => {
      if (!seen && mounted) {
        setVisible(true);
        // Animate in
        if (!reduceMotion) {
          Animated.parallel([
            Animated.timing(opacity, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(translateY, {
              toValue: 0,
              duration: 300,
              easing: Easing.out(Easing.ease),
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          opacity.setValue(1);
          translateY.setValue(0);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [tipId, reduceMotion, opacity, translateY]);

  const handleDismiss = async () => {
    await markTipSeen(tipId);

    if (!reduceMotion) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: position === 'top' ? -10 : 10,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setVisible(false);
        onDismiss?.();
      });
    } else {
      setVisible(false);
      onDismiss?.();
    }
  };

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? { top: insets.top + 8 } : styles.positionBottom,
        {
          backgroundColor: theme.colors.text,
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <View style={styles.content}>
        <Text style={[styles.message, { color: theme.colors.background }]}>
          {message}
        </Text>
        <TouchableOpacity
          onPress={handleDismiss}
          style={[styles.dismissButton, { backgroundColor: theme.colors.background + '20' }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.dismissText, { color: theme.colors.background }]}>Got it</Text>
        </TouchableOpacity>
      </View>
      <View
        style={[
          styles.arrow,
          position === 'top' ? styles.arrowBottom : styles.arrowTop,
          { borderTopColor: position === 'bottom' ? theme.colors.text : 'transparent' },
          { borderBottomColor: position === 'top' ? theme.colors.text : 'transparent' },
        ]}
      />
    </Animated.View>
  );
}

/**
 * Hook to manage tip visibility state
 * Returns whether the tip should be shown and a function to trigger checking
 */
export function useTipVisibility(tipId: TipId) {
  const [shouldShow, setShouldShow] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const checkAndShow = async () => {
    if (hasChecked) return;
    const seen = await hasSeenTip(tipId);
    if (!seen) {
      setShouldShow(true);
    }
    setHasChecked(true);
  };

  const hide = () => {
    setShouldShow(false);
  };

  return { shouldShow, checkAndShow, hide };
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  positionBottom: {
    bottom: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 12,
  },
  dismissButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  dismissText: {
    fontSize: 13,
    fontWeight: '600',
  },
  arrow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  arrowTop: {
    top: -8,
    borderBottomWidth: 8,
  },
  arrowBottom: {
    bottom: -8,
    borderTopWidth: 8,
  },
});

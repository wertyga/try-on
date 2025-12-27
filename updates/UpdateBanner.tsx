import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';

import {
  watchUpdates,
  openStorePage,
  dismissBinaryUpdate,
} from './update.utils';

const VISIBLE_TIMEOUT = 2000;

type Mode = 'hidden' | 'ota' | 'binary' | 'critical';

export function UpdateBanner() {
  const { t } = useTranslation();

  const [mode, setMode] = useState<Mode>('hidden');
  const restartRef = useRef<() => void>(() => {});

  const translateX = useSharedValue(0);

  const isDismissable = mode === 'binary';
  const isClickable = mode === 'binary' || mode === 'critical';

  const title = useMemo(() => {
    if (mode === 'ota') return t('updates.ota');
    if (mode === 'critical') return t('updates.critical.title');
    if (mode === 'binary') return t('updates.binary.title');
    return '';
  }, [mode, t]);

  const subtitle = useMemo(() => {
    if (mode === 'critical') return t('updates.critical.subtitle');
    if (mode === 'binary') return t('updates.binary.subtitle');
    return '';
  }, [mode, t]);

  const hide = () => {
    setMode('hidden');
  };

  const dismiss = async () => {
    if (!isDismissable) return;
    await dismissBinaryUpdate();
    hide();
  };

  // reset animation when showing
  useEffect(() => {
    translateX.value = 0;
  }, [mode]);

  useEffect(() => {
    const stop = watchUpdates({
      onBinary: ({ isCritical }) => {
        setMode(isCritical ? 'critical' : 'binary');
      },
      onReady: (restart) => {
        restartRef.current = restart;
        setMode('ota');
        setTimeout(() => restartRef.current(), VISIBLE_TIMEOUT);
      },
    });

    return stop;
  }, []);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // swipe right to dismiss (only for binary)
  const flingRight = useMemo(() => {
    return Gesture.Fling()
      .enabled(mode !== 'critical')
      .direction(Directions.RIGHT)
      .numberOfPointers(1)
      .onEnd(() => {
        translateX.value = withTiming(1000, { duration: 180 }, () => {
          runOnJS(dismiss)();
        });
      });
  }, [isDismissable]);

  if (mode === 'hidden') return null;

  return (
    <View style={s.wrap} pointerEvents="box-none">
      <GestureDetector gesture={flingRight}>
        <Animated.View style={[s.container, animatedStyles]}>
          <Pressable
            style={s.card}
            onPress={() => {
              if (!isClickable) return;
              openStorePage();
            }}
          >
            <Text style={s.title}>{title}</Text>
            {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}

            {isDismissable && (
              <Text style={s.hint}>
                {t('updates.binary.hintSwipe', 'Swipe right to hide')}
              </Text>
            )}
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 54 : 50,
    zIndex: 9999,
  },
  container: {
    marginLeft: 16,
    marginRight: 16,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  title: { color: 'white', fontWeight: '800', textAlign: 'center' },
  subtitle: {
    marginTop: 4,
    color: 'white',
    opacity: 0.9,
    fontWeight: '600',
    textAlign: 'center',
  },
  hint: {
    marginTop: 8,
    color: 'white',
    opacity: 0.6,
    fontSize: 12,
    fontWeight: '600',
  },
});

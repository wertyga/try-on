import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';
import { watchUpdates, openStorePage } from './update.utils';

const VISIBLE_TIMEOUT = 2000;

export function UpdateBanner() {
  const { t } = useTranslation();

  const [mode, setMode] = useState<'hidden' | 'ota' | 'critical'>('hidden');
  const restartRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stop = watchUpdates({
      onCritical: () => setMode('critical'),
      onReady: (restart) => {
        restartRef.current = restart;
        setMode('ota');

        setTimeout(() => {
          restartRef.current();
        }, VISIBLE_TIMEOUT);
      },
    });

    return stop;
  }, []);

  if (mode === 'hidden') return null;

  if (mode === 'critical') {
    return (
      <Pressable style={[s.wrap, s.top]} onPress={openStorePage}>
        <Text style={s.title}>{t('updates.critical.title')}</Text>
        <Text style={s.subtitle}>{t('updates.critical.subtitle')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={[s.wrap, s.top]}>
      <Text style={s.title}>{t('updates.ota')}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  top: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 116 : 76,
    zIndex: 9999,
  },
  wrap: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  title: {
    color: 'white',
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: 'white',
    opacity: 0.9,
    fontWeight: '600',
  },
});

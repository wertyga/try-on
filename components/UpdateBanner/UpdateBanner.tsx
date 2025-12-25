import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { watchUpdates } from './update.utils';

const VISIBLE_TIMEOUT = 2000;

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const restartRef = useRef<() => void>(() => {});

  useEffect(() => {
    const stop = watchUpdates({
      onReady: (restart) => {
        restartRef.current = restart;
        setVisible(true);

        // ⏱ авто-обновление через 2 секунды
        setTimeout(() => {
          restartRef.current();
        }, VISIBLE_TIMEOUT);
      },
    });

    return stop;
  }, []);

  if (!visible) return null;

  return (
    <View style={s.wrap}>
      <Text style={s.text}>Updating application…</Text>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 70,
    backgroundColor: '#111827',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '600',
  },
});

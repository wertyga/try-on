import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { watchUpdates } from './update.utils';

export default function UpdateBanner() {
  const [visible, setVisible] = useState(false);
  const [restart, setRestart] = useState<() => void>(() => () => {});

  useEffect(() => {
    // Начинаем слушать обновления; когда скачано — покажем баннер
    const stop = watchUpdates({
      prompt: (doRestart) => {
        setRestart(() => doRestart);
        setVisible(true);
      },
    });
    return stop;
  }, []);

  if (!visible) return null;

  return (
    <View style={s.wrap}>
      <Text style={s.text}>A new version is ready.</Text>
      <Pressable style={s.btn} onPress={restart}>
        <Text style={s.btnText}>Restart</Text>
      </Pressable>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  text: { color: 'white', fontWeight: '600' },
  btn: {
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnText: { color: '#111827', fontWeight: '700' },
});

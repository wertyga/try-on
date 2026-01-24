import { Pressable, StyleSheet, Text } from 'react-native';
import React, { FC } from 'react';

export type TErrorBox = {
  error?: string | null;
  clearError?: () => void;
};

export const ErrorBox: FC<TErrorBox> = ({ error, clearError }) => {
  if (!error) return null;

  return (
    <Pressable onPress={clearError} style={s.errorBox}>
      <Text style={s.errorText}>{error}</Text>
      <Text style={s.errorHint}>Tap to dismiss</Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  errorBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  errorText: { color: '#991B1B', fontWeight: '900' },
  errorHint: { color: '#991B1B', marginTop: 4, fontSize: 12 },
});

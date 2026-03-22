import React, { FC } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

type TStatusVariant = 'error' | 'success' | 'info';

export type TStatusBoxProps = {
  message?: string | null;
  title?: string;
  hint?: string;
  variant?: TStatusVariant;
  onPress?: () => void;
};

const VARIANT_STYLES: Record<
  TStatusVariant,
  { box: string; border: string; text: string }
> = {
  error: {
    box: '#FEF2F2',
    border: '#FCA5A5',
    text: '#991B1B',
  },
  success: {
    box: '#ECFDF5',
    border: '#86EFAC',
    text: '#166534',
  },
  info: {
    box: '#EFF6FF',
    border: '#93C5FD',
    text: '#1D4ED8',
  },
};

export const StatusBox: FC<TStatusBoxProps> = ({
  message,
  title,
  hint,
  variant = 'error',
  onPress,
}) => {
  if (!message) return null;

  const palette = VARIANT_STYLES[variant];

  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        s.box,
        {
          backgroundColor: palette.box,
          borderColor: palette.border,
        },
      ]}
    >
      {!!title && <Text style={[s.title, { color: palette.text }]}>{title}</Text>}
      <Text style={[s.message, { color: palette.text }]}>{message}</Text>
      {!!hint && <Text style={[s.hint, { color: palette.text }]}>{hint}</Text>}
    </Pressable>
  );
};

const s = StyleSheet.create({
  box: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  title: {
    fontWeight: '900',
    marginBottom: 4,
  },
  message: {
    fontWeight: '700',
  },
  hint: {
    marginTop: 4,
    fontSize: 12,
  },
});

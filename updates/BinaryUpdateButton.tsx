import React, { FC, useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';

import {
  getBinaryUpdateStatus,
  BinaryUpdateStatus,
  openStorePage,
} from './update.utils';

export const BinaryUpdateButton: FC<{ style?: ViewStyle }> = ({ style }) => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<BinaryUpdateStatus>('none');

  useEffect(() => {
    const s = getBinaryUpdateStatus();

    setStatus(s);
  }, []);

  if (status === 'none') return null;

  return (
    <Pressable style={[s.btn, style]} onPress={openStorePage}>
      <Text style={s.text}>
        {status === 'critical'
          ? t('updates.critical.title')
          : t('updates.binary.button')}
      </Text>
    </Pressable>
  );
};

const s = StyleSheet.create({
  btn: {
    backgroundColor: '#111827',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontWeight: '700',
  },
});

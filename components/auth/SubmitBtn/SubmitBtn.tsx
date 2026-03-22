import React from 'react';

import { StyleSheet } from 'react-native';
import { Button } from '@/components/ui/button';
import { FONTS } from '@/types';

type Props = {
  onPress: () => void;
  children: string;
  isLoading?: boolean;
};

export const SubmitBtn = ({ onPress, children, isLoading }: Props) => {
  return (
    <Button
      style={styles.submitBtn}
      onPress={onPress}
      dark
      isLoading={isLoading}
    >
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    width: '100%',
    marginTop: 20,
    fontFamily: FONTS.OpenSansSemiBold,
  },
  submitText: {},
});

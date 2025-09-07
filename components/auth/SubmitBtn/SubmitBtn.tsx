import React from 'react';

import {StyleSheet, Text, TouchableOpacity} from 'react-native';
import { Button } from '@/components/ui/button';


// import { CONSTANTS } from '@/styles/constants';

type Props = {
  onPress: () => void;
  children: string;
};

export const SubmitBtn = ({ onPress, children }: Props) => {
  return (
    <Button style={styles.submitBtn} onPress={onPress}>
      {children}
    </Button>
  );
};

const styles = StyleSheet.create({
  submitBtn: {
    width: '100%',
    marginTop: 20,
  },
  submitText: {
    // color: CONSTANTS.colors.bgDarkest,
  },
});

import React from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';

import { StyleProp } from 'react-native/Libraries/StyleSheet/StyleSheet';
import { Colors } from '@/constants/Colors';

export type TInputProps = Omit<TextInputProps, 'onChangeText' | 'onChange'> & {
  onChange: (value: string) => void;
  error?: string;
  style?: StyleProp<ViewStyle>; // внешний контейнер
  inputStyle?: StyleProp<TextStyle>; // стиль именно TextInput
};

export const Input = ({
  onChange,
  error,
  style,
  inputStyle,
  multiline,
  ...inputProps
}: TInputProps) => {
  return (
    <View style={style}>
      <View style={[styles.field, error && styles.fieldError]}>
        <TextInput
          style={[
            styles.inputBase,
            multiline ? styles.inputMultiline : styles.inputSingle,
            inputStyle,
          ]}
          multiline={multiline}
          onChangeText={onChange}
          {...inputProps}
        />
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  field: {
    width: '100%',
    borderColor: Colors.light.text,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fieldError: {
    borderColor: '#D33', // можешь оставить Colors.light.text если не хочешь красный
  },

  inputBase: {
    paddingHorizontal: 10,
    backgroundColor: 'rgba(246, 245, 242, 0.40)',
    color: 'black',
  },
  inputSingle: {
    height: 42,
    paddingVertical: 10,
  },
  inputMultiline: {
    minHeight: 120,
    paddingVertical: 10,
    textAlignVertical: 'top',
  },

  error: {
    color: '#D33',
    fontSize: 10,
    marginTop: 6,
  },
});

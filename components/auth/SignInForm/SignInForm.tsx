import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SubmitBtn } from '../SubmitBtn/SubmitBtn';
import { Input } from '@/components/ui/Input';
import { yupResolver } from '@hookform/resolvers/yup';
import { SIGNIN_FORM_SCHEMA } from './SignInForm.utils';

type Props = {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
};

export const SignInForm = ({ onSubmit, isLoading }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(SIGNIN_FORM_SCHEMA),
  });

  return (
    <View>
      <Controller
        control={control as any}
        render={({ field: { onChange, value } }) => {
          return (
            <Input
              style={styles.input}
              value={value}
              onChange={onChange}
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={errors?.email?.message}
            />
          );
        }}
        name="email"
      />
      <Controller
        control={control as any}
        render={({ field: { onChange, value } }) => {
          return (
            <Input
              style={styles.input}
              value={value}
              onChange={onChange}
              placeholder="Password"
              secureTextEntry
              textContentType="password"
              error={errors?.password?.message}
            />
          );
        }}
        name="password"
      />

      <SubmitBtn onPress={handleSubmit(onSubmit)} isLoading={isLoading}>
        Sign in
      </SubmitBtn>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 15,
  },
});

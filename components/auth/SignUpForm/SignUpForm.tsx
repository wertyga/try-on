import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Controller, useForm } from 'react-hook-form';

import { SubmitBtn } from '../SubmitBtn/SubmitBtn';
import { Input } from '@/components/ui/Input';
import { yupResolver } from '@hookform/resolvers/yup';

import { REGISTER_FORM_SCHEMA } from './SignUpForm.utils';

type Props = {
  onSubmit: (data: any) => void;
  isLoading?: boolean;
};

export const SignUpForm = ({ onSubmit, isLoading }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(REGISTER_FORM_SCHEMA),
  });

  return (
    <View style={styles.container}>
      <Controller
        control={control as any}
        render={({ field: { onChange, value } }) => {
          return (
            <Input
              style={styles.input}
              value={value}
              onChange={onChange}
              placeholder="E-mail"
              keyboardType="email-address"
              textContentType="emailAddress"
              autoCapitalize="none"
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
              placeholder="Username"
              error={errors?.username?.message}
            />
          );
        }}
        name="username"
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
      <Controller
        control={control as any}
        render={({ field: { onChange, value } }) => {
          return (
            <Input
              style={styles.input}
              value={value}
              onChange={onChange}
              placeholder="Confirm password"
              secureTextEntry
              textContentType="password"
              error={errors?.confirmPassword?.message}
            />
          );
        }}
        name="confirmPassword"
      />

      <SubmitBtn onPress={handleSubmit(onSubmit)} isLoading={isLoading}>
        Sign up
      </SubmitBtn>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  input: {
    marginBottom: 15,
  },
});

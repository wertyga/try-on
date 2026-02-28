import React from 'react';

import { StyleSheet, View } from 'react-native';

import { Controller, useForm } from 'react-hook-form';

import { CHANGE_EMAIL_FORM_SCHEMA } from '@/components/auth/ChangeEmailForm/ChangeEmailForm.utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/Input';
import { yupResolver } from '@hookform/resolvers/yup';

type Props = {
  onSubmit: (data: any) => void;
};

export const ChangeEmailForm = ({ onSubmit }: Props) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(CHANGE_EMAIL_FORM_SCHEMA),
  });

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Controller
          control={control as any}
          render={({ field: { onChange, value } }) => {
            return (
              <Input
                value={value}
                onChange={onChange}
                placeholder="New e-mail"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                error={errors?.newEmail?.message}
              />
            );
          }}
          name="newEmail"
        />
        <Controller
          control={control as any}
          render={({ field: { onChange, value } }) => {
            return (
              <Input
                value={value}
                // @ts-ignore
                onChangeText={onChange}
                placeholder="Password"
                secureTextEntry
                textContentType="password"
                error={errors?.password?.message}
              />
            );
          }}
          name="password"
        />
      </View>
      <Button onPress={handleSubmit(onSubmit)}>Change E-mail</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  form: {
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },
  input: {},
});

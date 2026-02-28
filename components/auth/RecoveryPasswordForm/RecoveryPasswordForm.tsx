import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { SubmitBtn } from '../SubmitBtn/SubmitBtn';
import { yupResolver } from '@hookform/resolvers/yup';
import { getRecoveryPasswordSchema } from './RecoveryPasswordForm.utils';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/button';

type Props = {
  onSubmit: (data: any) => void;
  codeSent?: boolean;
};

export const RecoveryPasswordForm = ({ onSubmit, codeSent }: Props) => {
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
    watch,
  } = useForm({
    resolver: yupResolver(getRecoveryPasswordSchema(codeSent)),
  });
  const email = watch('email');

  const goSubmit = (refetch?: boolean) => {
    if (refetch) {
      reset({
        code: '',
        password: '',
        confirmPassword: '',
        email,
      });

      return onSubmit({ email, refetch });
    }

    return handleSubmit(onSubmit)();
  };

  return (
    <View>
      <Controller
        control={control}
        render={({ field: { value, onChange } }) => {
          return (
            <Input
              style={styles.input}
              value={value}
              onChange={onChange}
              placeholder="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
              error={errors?.email?.message as string}
            />
          );
        }}
        name="email"
      />
      {codeSent && (
        <>
          <Controller
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <Input
                  style={styles.input}
                  value={value}
                  onChange={onChange}
                  placeholder="Your code here"
                  autoCapitalize="none"
                  error={errors?.code?.message as string}
                />
              );
            }}
            name="code"
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
                  autoCapitalize="none"
                  secureTextEntry
                  textContentType="password"
                  error={errors?.password?.message as string}
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
                  placeholder="Confirm your password"
                  autoCapitalize="none"
                  secureTextEntry
                  textContentType="password"
                  error={errors?.confirmPassword?.message as string}
                />
              );
            }}
            name="confirmPassword"
          />
        </>
      )}

      <SubmitBtn onPress={() => goSubmit()}>
        {codeSent ? 'Change password' : 'Send request'}
      </SubmitBtn>

      {codeSent && (
        <Button
          onPress={() => goSubmit(true)}
          style={styles.sendAgain}
          transparent
        >
          Send again
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    marginBottom: 15,
  },
  sendAgain: {
    marginTop: 20,
  },
});

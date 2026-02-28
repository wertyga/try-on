import React, { useState } from 'react';
import { router } from 'expo-router';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';

import {
  OauthApple,
  OauthGoogle,
  SignInForm,
  SignUpForm,
} from '@/components/auth';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';

import { AuthCommonRequest } from '@/types';
import { useAuthEmailStore } from '@/stores/auth/useAuthEmailStore';
import { useAuthStore } from '@/stores';
import { useTranslation } from 'react-i18next';
import { RecoveryPasswordForm } from '@/components/auth/RecoveryPasswordForm/RecoveryPasswordForm';

type TState = 'signin' | 'signup' | 'recovery-password' | 'change-email';

const Login = () => {
  const {
    signUp,
    isLoading: isEmailLoading,
    recoveryPassword,
    recoveryPasswordInit,
  } = useAuthEmailStore();
  const { signInByEmail, isLoading: isAuthLoading } = useAuthStore();

  const { t } = useTranslation();

  const isLoading = isEmailLoading || isAuthLoading;

  const [state, setState] = useState<TState>('signin');
  const [codeSent, setCodeSent] = useState(false);

  const toggleFormState = () => {
    setState(state === 'signin' ? 'signup' : 'signin');
  };

  const onSignUp = async (data: AuthCommonRequest) => {
    const isSuccess = await signUp(data);

    if (isSuccess) {
      setState('signin');
    }
  };

  const onSignIn = async (data: AuthCommonRequest) => {
    const isSuccess = await signInByEmail(data);

    if (isSuccess) {
      router.push('/(tabs)/try-on');
    }
  };

  const onRecoveryPassword = async ({
    email,
    refetch,
    code: token,
    password,
  }: any) => {
    if (!codeSent || refetch) {
      const { success } = await recoveryPasswordInit({ email });

      if (success) {
        setCodeSent(true);
      }
    } else {
      const { success } = await recoveryPassword({ token, password, email });
      if (success) {
        setState('signin');
      }
    }
  };

  const hideOauth = state === 'recovery-password';
  const title =
    state === 'recovery-password'
      ? t('auth.titlePasswordRecovery')
      : t('profile.titleLogin');

  return (
    <Container.WithTabBar isLoading={isLoading} title={title}>
      <ScrollView style={styles.content}>
        <View style={{ alignItems: 'flex-end' }}>
          <Button style={styles.goToText} onPress={toggleFormState} transparent>
            {state === 'signin' ? 'Register' : 'Login'}
          </Button>
        </View>

        {state === 'signup' && (
          <SignUpForm onSubmit={onSignUp} isLoading={isLoading} />
        )}
        {state === 'signin' && (
          <SignInForm onSubmit={onSignIn} isLoading={isLoading} />
        )}
        {state === 'recovery-password' && (
          <RecoveryPasswordForm
            onSubmit={onRecoveryPassword}
            codeSent={codeSent}
          />
        )}

        {!hideOauth && (
          <View style={styles.oauth}>
            {Platform.OS === 'ios' && <OauthApple />}

            <OauthGoogle />
          </View>
        )}

        <Button
          transparent
          style={styles.forgotText}
          onPress={() => setState('recovery-password')}
        >
          Forgot password?
        </Button>
      </ScrollView>
    </Container.WithTabBar>
  );
};

const styles = StyleSheet.create({
  header: {
    position: 'relative',
    paddingHorizontal: 0,
  },
  content: {},
  goToText: {
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  forgotText: {
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  oauth: {
    marginTop: 30,
    gap: 12,
  },
});

export default Login;

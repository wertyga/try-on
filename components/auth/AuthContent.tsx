import React, { FC, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Button } from '@/components/ui/button';
import { AuthCommonRequest } from '@/types';
import { useAuthStore } from '@/stores';
import { useAuthEmailStore } from '@/stores/auth/useAuthEmailStore';
import OauthApple from '@/components/auth/OauthApple/OauthApple';
import OauthGoogle from '@/components/auth/OauthGoogle/OauthGoogle';
import { SignInForm } from '@/components/auth/SignInForm/SignInForm';
import { SignUpForm } from '@/components/auth/SignUpForm/SignUpForm';
import { RecoveryPasswordForm } from '@/components/auth/RecoveryPasswordForm/RecoveryPasswordForm';
import { Colors } from '@/constants/Colors';

type TState = 'signin' | 'signup' | 'recovery-password';

type AuthContentProps = {
  onAuthSuccess: () => void;
  resetKey?: boolean | string | number;
  showMaybeLater?: boolean;
  onMaybeLaterPress?: () => void;
};

export const AuthContent: FC<AuthContentProps> = ({
  onAuthSuccess,
  resetKey,
  showMaybeLater,
  onMaybeLaterPress,
}) => {
  const {
    signUp,
    isLoading: isEmailLoading,
    recoveryPassword,
    recoveryPasswordInit,
  } = useAuthEmailStore();
  const { signInByEmail, isLoading: isAuthLoading } = useAuthStore();

  const [state, setState] = useState<TState>('signin');
  const [codeSent, setCodeSent] = useState(false);

  useEffect(() => {
    setState('signin');
    setCodeSent(false);
  }, [resetKey]);

  const isLoading = isEmailLoading || isAuthLoading;
  const hideOauth = state === 'recovery-password';

  const toggleFormState = () => {
    setState((current) => (current === 'signin' ? 'signup' : 'signin'));
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
      onAuthSuccess();
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

      return;
    }

    const { success } = await recoveryPassword({ token, password, email });

    if (success) {
      setCodeSent(false);
      setState('signin');
    }
  };

  return (
    <ScrollView
      style={s.scroll}
      contentContainerStyle={s.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.card}>
        <Text style={s.cardTitle}>
          {state === 'signin'
            ? 'Sign In'
            : state === 'signup'
              ? 'Create Account'
              : 'Reset Password'}
        </Text>

        <View style={s.topRow}>
          <Button style={s.switchButton} onPress={toggleFormState} transparent>
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
          <View style={s.oauth}>
            {Platform.OS === 'ios' && <OauthApple onSuccess={onAuthSuccess} />}
            <OauthGoogle onSuccess={onAuthSuccess} />
          </View>
        )}

        <Button
          transparent
          style={s.forgotButton}
          onPress={() => setState('recovery-password')}
        >
          Forgot password?
        </Button>

        {showMaybeLater && onMaybeLaterPress ? (
          <Button transparent style={s.laterButton} onPress={onMaybeLaterPress}>
            Maybe later
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
};

const s = StyleSheet.create({
  scroll: {
    flexShrink: 1,
  },
  content: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.cardBg,
  },
  cardTitle: {
    textAlign: 'center',
    fontSize: 32,
    lineHeight: 38,
    color: Colors.light.text,
    marginBottom: 8,
    fontWeight: '500',
  },
  topRow: {
    alignItems: 'flex-end',
  },
  switchButton: {
    marginBottom: 10,
  },
  oauth: {
    marginTop: 30,
    gap: 12,
  },
  forgotButton: {
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  laterButton: {
    marginTop: 8,
  },
});

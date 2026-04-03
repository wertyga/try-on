import React from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SignInForm } from '@/components/auth';
import { AuthRouteCard } from '@/components/auth/AuthRouteCard';
import { useAuthStore } from '@/stores';
import { SignInRequest } from '@/stores/auth/auth.types';

export default function SignInScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const nextRoute = (redirectTo || '/(tabs)/try-on') as Href;

  const signInByEmail = useAuthStore((s) => s.signInByEmail);
  const isLoading = useAuthStore((s) => s.isLoading);

  const onAuthSuccess = () => {
    router.replace(nextRoute);
  };

  const emailSignIn = async (data: SignInRequest) => {
    const isSucceed = await signInByEmail(data);

    if (isSucceed) {
      onAuthSuccess();
    }
  };

  return (
    <AuthRouteCard
      title={t('profile.titleLogin')}
      subtitle="Sign in to save your looks and sync your account."
      primarySwitchLabel="Register"
      onPrimarySwitchPress={() =>
        router.push({ pathname: '/signup', params: { redirectTo: nextRoute } })
      }
      secondarySwitchLabel="Forgot password?"
      onSecondarySwitchPress={() =>
        router.push({
          pathname: '/recovery-password',
          params: { redirectTo: nextRoute },
        })
      }
      onAuthSuccess={onAuthSuccess}
    >
      <SignInForm onSubmit={emailSignIn} isLoading={isLoading} />
    </AuthRouteCard>
  );
}

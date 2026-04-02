import React from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { SignUpForm } from '@/components/auth';
import { AuthRouteCard } from '@/components/auth/AuthRouteCard';
import { useAuthEmailStore } from '@/stores/auth/useAuthEmailStore';

export default function SignUpScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const nextRoute = (redirectTo || '/try-on') as Href;

  const signUp = useAuthEmailStore((s) => s.signUp);
  const isLoading = useAuthEmailStore((s) => s.isLoading);

  const onSignUp = async (data: any) => {
    const isSuccess = await signUp(data);

    if (isSuccess) {
      router.replace({ pathname: '/signin', params: { redirectTo: nextRoute } });
    }
  };

  return (
    <AuthRouteCard
      title="Register"
      subtitle="Create an account to keep your try-ons across devices."
      primarySwitchLabel="Login"
      onPrimarySwitchPress={() =>
        router.replace({ pathname: '/signin', params: { redirectTo: nextRoute } })
      }
      onAuthSuccess={() => router.replace(nextRoute)}
    >
      <SignUpForm onSubmit={onSignUp} isLoading={isLoading} />
    </AuthRouteCard>
  );
}

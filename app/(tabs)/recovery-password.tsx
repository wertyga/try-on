import React, { useState } from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { RecoveryPasswordForm } from '@/components/auth/RecoveryPasswordForm/RecoveryPasswordForm';
import { AuthRouteCard } from '@/components/auth/AuthRouteCard';
import { useAuthEmailStore } from '@/stores/auth/useAuthEmailStore';

export default function RecoveryPasswordScreen() {
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const nextRoute = (redirectTo || '/try-on') as Href;

  const recoveryPassword = useAuthEmailStore((s) => s.recoveryPassword);
  const recoveryPasswordInit = useAuthEmailStore((s) => s.recoveryPasswordInit);
  const [codeSent, setCodeSent] = useState(false);

  const onSubmit = async ({
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
      router.replace({ pathname: '/signin', params: { redirectTo: nextRoute } });
    }
  };

  return (
    <AuthRouteCard
      title="Recovery password"
      subtitle="Enter your e-mail and follow the recovery steps."
      primarySwitchLabel="Back to login"
      onPrimarySwitchPress={() =>
        router.replace({ pathname: '/signin', params: { redirectTo: nextRoute } })
      }
      showOauth={false}
      onAuthSuccess={() => router.replace(nextRoute)}
    >
      <RecoveryPasswordForm onSubmit={onSubmit} codeSent={codeSent} />
    </AuthRouteCard>
  );
}

import React from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { AuthContent } from '@/components/auth/AuthContent';
import { Container } from '@/components/ui/Container';

const Login = () => {
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { t } = useTranslation();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const nextRoute = (redirectTo || '/try-on') as Href;

  return (
    <Container.WithTabBar title={t('profile.titleLogin')}>
      <AuthContent onAuthSuccess={() => router.replace(nextRoute)} />
    </Container.WithTabBar>
  );
};

export default Login;

import React from 'react';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/constants/Colors';

import { AuthContent } from '@/components/auth/AuthContent';
import { Container } from '@/components/ui/Container';

const Login = () => {
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { t } = useTranslation();
  const redirectTo = Array.isArray(params.redirectTo)
    ? params.redirectTo[0]
    : params.redirectTo;
  const nextRoute = (redirectTo || '/(tabs)/try-on') as Href;

  return (
    <Container.WithTabBar>
      <View style={s.header}>
        <Text style={s.title}>{t('profile.titleLogin')}</Text>
        <Text style={s.subtitle}>Your Virtual Fashion Fitting Room</Text>
      </View>
      <AuthContent onAuthSuccess={() => router.replace(nextRoute)} />
    </Container.WithTabBar>
  );
};

export default Login;

const s = StyleSheet.create({
  header: {
    marginTop: 6,
    marginBottom: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    lineHeight: 40,
    color: Colors.light.text,
    fontWeight: '500',
  },
  subtitle: {
    color: Colors.light.textDisabled,
    marginTop: 4,
    fontSize: 14,
  },
});

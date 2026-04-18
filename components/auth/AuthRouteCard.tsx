import React, { ReactNode } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/button';
import OauthApple from '@/components/auth/OauthApple/OauthApple';
import OauthGoogle from '@/components/auth/OauthGoogle/OauthGoogle';

type AuthRouteCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onPrimarySwitchPress?: () => void;
  primarySwitchLabel?: string;
  onSecondarySwitchPress?: () => void;
  secondarySwitchLabel?: string;
  showOauth?: boolean;
  onAuthSuccess: () => void;
};

export function AuthRouteCard({
  title,
  subtitle,
  children,
  onPrimarySwitchPress,
  primarySwitchLabel,
  onSecondarySwitchPress,
  secondarySwitchLabel,
  showOauth = true,
  onAuthSuccess,
}: AuthRouteCardProps) {
  return (
    <Container.WithTabBar title={title}>
      <View style={s.header}>
        {!!subtitle && <Text style={s.subtitle}>{subtitle}</Text>}

        {/*{!!primarySwitchLabel && !!onPrimarySwitchPress && (*/}
        {/*  <Button transparent flexEnd onPress={onPrimarySwitchPress}>*/}
        {/*    {primarySwitchLabel}*/}
        {/*  </Button>*/}
        {/*)}*/}
      </View>

      {/*{children}*/}

      {/*{!!secondarySwitchLabel && !!onSecondarySwitchPress && (*/}
      {/*  <Button*/}
      {/*    transparent*/}
      {/*    flexEnd*/}
      {/*    style={s.secondaryButton}*/}
      {/*    onPress={onSecondarySwitchPress}*/}
      {/*  >*/}
      {/*    {secondarySwitchLabel}*/}
      {/*  </Button>*/}
      {/*)}*/}

      {showOauth && (
        <View style={s.oauth}>
          {Platform.OS === 'ios' && <OauthApple onSuccess={onAuthSuccess} />}
          <OauthGoogle onSuccess={onAuthSuccess} />
        </View>
      )}
    </Container.WithTabBar>
  );
}

const s = StyleSheet.create({
  header: {
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    marginBottom: 8,
  },
  oauth: {
    marginTop: 30,
    gap: 12,
  },
  secondaryButton: {
    marginTop: 12,
  },
});

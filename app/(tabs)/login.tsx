import React, { useEffect } from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { Container } from '@/components/ui/Container';
import { useAuthStore } from '@/stores';

export default function Login() {
  const { signInWithGoogle } = useAuthStore();

  useEffect(() => {
    signInWithGoogle();
  }, []);

  return (
    <Container.WithTabBar
      title={'Login'}
      childrenStyle={{
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
        }}
      >
        <Text>v.1</Text>
      </View>
    </Container.WithTabBar>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  header: {
    position: 'relative',
    paddingHorizontal: 0,
  },
  content: {
    marginTop: 30,
  },
  goToText: {
    marginBottom: 20,
  },
  forgotText: {
    marginTop: 20,
  },
  oauth: {
    marginTop: 30,
  },
});

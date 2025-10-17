import React from 'react';

import { StyleSheet, View, Text } from 'react-native';

import { OauthGoogle } from '@/components/auth';
import { Container } from '@/components/ui/Container';

export default function Login() {
  return (
    <Container.WithTabBar
      title={'Login'}
      childrenStyle={{
        justifyContent: 'center',
        flex: 1,
      }}
    >
      <View style={styles.oauth}>
        <OauthGoogle />
      </View>

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

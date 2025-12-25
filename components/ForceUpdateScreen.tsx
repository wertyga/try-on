import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Linking,
  Platform,
} from 'react-native';
import { useForceUpdateStore } from '@/stores';

const ANDROID_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.wertyga.tryon';
// iOS потом добавишь:
const IOS_STORE_URL = 'https://apps.apple.com/app/idYOUR_APP_ID';

export default function ForceUpdateScreen() {
  const { minBuild, message } = useForceUpdateStore();

  const openStore = () => {
    const url = Platform.OS === 'ios' ? IOS_STORE_URL : ANDROID_STORE_URL;
    Linking.openURL(url);
  };

  return (
    <View style={s.wrap}>
      <Text style={s.title}>Update required</Text>

      <Text style={s.text}>
        {message || 'Please update the app to continue.'}
      </Text>

      {!!minBuild && (
        <Text style={s.muted}>Minimum required build: {minBuild}</Text>
      )}

      <Pressable style={s.btn} onPress={openStore}>
        <Text style={s.btnText}>Update</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', padding: 18, gap: 12 },
  title: { fontSize: 22, fontWeight: '900' },
  text: { color: '#111827', fontSize: 15 },
  muted: { color: '#6B7280' },
  btn: {
    marginTop: 8,
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '900' },
});

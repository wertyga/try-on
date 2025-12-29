import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import Checkbox from 'expo-checkbox';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { Container } from '@/components/ui/Container';
import { useTranslation } from 'react-i18next';
import { Analytics } from '@/analytics';
import { getCurrentBuildNumber } from '@/updates/update.utils';

export default function Welcome() {
  const { t } = useTranslation();

  const { setUserPhoto, userPhoto, consent, setConsent } = useTryOnStore();
  const [busy, setBusy] = useState(false);

  async function pickFromGallery() {
    try {
      await Analytics.event('photo_pick_start', { source: 'gallery' });

      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          t('permissions.required'),
          Platform.select({
            ios: t('permissions.photos.ios'),
            android: t('permissions.photos.android'),
          }) as string,
        );
        return;
      }
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (res.canceled) return;
      const a = res.assets[0];
      await processAndSet(a.uri, a.width, a.height);

      await Analytics.event('photo_pick_success', {
        source: 'gallery',
        width: a.width,
        height: a.height,
      });
    } catch (e: any) {
      await Analytics.event('photo_pick_error', {
        source: 'gallery',
        message: e?.message,
      });

      Alert.alert(
        t('errors.pickImageTitle'),
        e?.message || t('errors.pickImageFallback'),
      );
    }
  }

  async function takeFromCamera() {
    try {
      await Analytics.event('photo_pick_start', { source: 'camera' });

      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert(
          t('permissions.required'),
          Platform.select({
            ios: t('permissions.camera.ios'),
            android: t('permissions.camera.android'),
          }) as string,
        );
        return;
      }

      const res = await ImagePicker.launchCameraAsync({ quality: 1 });

      if (res.canceled) return;

      const a = res.assets[0];

      await processAndSet(a.uri, a.width, a.height);

      await Analytics.event('photo_pick_success', { source: 'camera' });
    } catch (e: any) {
      await Analytics.event('photo_pick_error', {
        source: 'camera',
        message: e?.message,
      });

      Alert.alert(
        t('errors.cameraTitle'),
        e?.message || t('errors.cameraFallback'),
      );
    }
  }

  // JPEG + base64, limit longest side ~2000px
  async function processAndSet(uri: string, width?: number, height?: number) {
    setBusy(true);
    try {
      const longest = Math.max(width ?? 0, height ?? 0) || 2000;
      const target = Math.min(longest, 2000);
      const ops =
        width && height
          ? [
              {
                resize:
                  width >= height ? { width: target } : { height: target },
              },
            ]
          : [{ resize: { width: 2000 } }];

      const manip = await ImageManipulator.manipulateAsync(uri, ops, {
        compress: 0.9,
        format: ImageManipulator.SaveFormat.JPEG,
        base64: true,
      });

      setUserPhoto({ uri: manip.uri, base64: manip.base64 ?? '' });
    } finally {
      setBusy(false);
    }
  }

  async function clear() {
    await Analytics.event('photo_clear');
    setUserPhoto(null);
  }

  async function onContinue() {
    await Analytics.event('welcome_continue_click', {
      has_photo: !!userPhoto,
      consent: !!consent,
    });

    if (!userPhoto) {
      return Alert.alert(
        t('welcome.needPhotoTitle'),
        t('welcome.needPhotoText'),
      );
    }
    if (!consent) {
      return Alert.alert(
        t('welcome.needConsentTitle'),
        t('welcome.needConsentText'),
      );
    }
    router.replace('/(tabs)/try-on');
  }

  return (
    <Container contentContainerStyle={{ paddingTop: 30 }}>
      <Text style={styles.title}>{t('welcome.title')}</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>

      <View style={styles.actions}>
        <Pressable
          style={styles.primaryBtn}
          onPress={takeFromCamera}
          disabled={busy}
        >
          <Text style={styles.primaryBtnText}>{t('welcome.takePhoto')}</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryBtn}
          onPress={pickFromGallery}
          disabled={busy}
        >
          <Text style={styles.secondaryBtnText}>
            {t('welcome.pickFromGallery')}
          </Text>
        </Pressable>
      </View>

      {busy && <ActivityIndicator size="large" />}

      {userPhoto ? (
        <View style={styles.previewWrap}>
          <View style={styles.previewFrame}>
            <Image
              source={{ uri: userPhoto.uri }}
              style={styles.preview}
              resizeMode="contain"
            />
          </View>
          <Pressable style={styles.clearBtn} onPress={clear}>
            <Text style={styles.clearBtnText}>{t('welcome.clear')}</Text>
          </Pressable>
        </View>
      ) : (
        <Text style={styles.hint}>{t('welcome.tips')}</Text>
      )}

      <Pressable style={styles.consentRow} onPress={() => setConsent(!consent)}>
        <Checkbox value={consent} color={consent ? '#111827' : undefined} />
        <Text style={styles.consentText}>
          {t('welcome.consentLabel')}{' '}
          <Text style={styles.link}>{t('welcome.policy')}</Text>
        </Text>
      </Pressable>

      <Pressable
        style={[
          styles.continueBtn,
          (!userPhoto || !consent || busy) && styles.continueBtnDisabled,
        ]}
        onPress={onContinue}
        disabled={!userPhoto || !consent || busy}
      >
        <Text style={styles.continueBtnText}>{t('welcome.continue')}</Text>
      </Pressable>
    </Container>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '800', marginTop: 24, marginBottom: 4 },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  actions: { width: '100%', gap: 12 },
  primaryBtn: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  secondaryBtn: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: { color: '#111827', fontSize: 16, fontWeight: '600' },

  previewWrap: { width: '100%', alignItems: 'center', marginTop: 16 },
  previewFrame: {
    width: '100%',
    height: 420,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },

  clearBtn: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
  },
  clearBtnText: { color: '#991B1B', fontWeight: '700' },

  hint: { marginTop: 12, color: '#6B7280', textAlign: 'center' },

  consentRow: {
    marginTop: 16,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  consentText: { flex: 1, color: '#111827' },
  link: { textDecorationLine: 'underline' },

  continueBtn: {
    marginTop: 16,
    width: '100%',
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueBtnDisabled: { opacity: 0.6 },
  continueBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

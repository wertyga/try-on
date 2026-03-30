import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { BottomModal } from '@/components/ui/BottomModal';

const { height } = Dimensions.get('window');

type TUserPhotoUploaderProps = {
  variant?: 'default' | 'hero';
};

export function UserPhotoUploader({ variant = 'default' }: TUserPhotoUploaderProps) {
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const { t } = useTranslation();

  const { userPhoto, setUserPhoto } = useTryOnStore();

  async function processAndSetPhoto(
    uri: string,
    width?: number,
    height?: number,
  ) {
    setIsPhotoProcessing(true);

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
      setIsSourceModalVisible(false);
    } finally {
      setIsPhotoProcessing(false);
    }
  }

  async function pickFromGallery() {
    setIsPhotoLoading(true);

    try {
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

      const asset = res.assets[0];

      await processAndSetPhoto(asset.uri, asset.width, asset.height);
    } catch (e: any) {
      Alert.alert(
        t('errors.pickImageTitle'),
        e?.message || t('errors.pickImageFallback'),
      );
    } finally {
      setIsPhotoLoading(false);
    }
  }

  async function takeFromCamera() {
    setIsPhotoLoading(true);

    try {
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

      const asset = res.assets[0];

      await processAndSetPhoto(asset.uri, asset.width, asset.height);
    } catch (e: any) {
      Alert.alert(
        t('errors.cameraTitle'),
        e?.message || t('errors.cameraFallback'),
      );
    } finally {
      setIsPhotoLoading(false);
    }
  }

  return (
    <>
      <View style={[s.card, variant === 'hero' && s.heroCard]}>
        {variant === 'hero' && (
          <Text style={s.heroTitle}>See how the clothes look on you!</Text>
        )}

        <Pressable
          style={[s.previewFrame, variant === 'hero' && s.heroPreviewFrame]}
          onPress={() => setIsSourceModalVisible(true)}
          disabled={isPhotoLoading || isPhotoProcessing}
        >
          {userPhoto ? (
            <Image
              source={{ uri: userPhoto.uri }}
              style={s.preview}
              resizeMode={variant === 'hero' ? 'cover' : 'contain'}
            />
          ) : (
            <View style={s.placeholder}>
              <Text style={s.muted}>{t('home.noPhoto')}</Text>
              <Text style={s.placeholderCta}>{t('home.addPhoto')}</Text>
            </View>
          )}

          {(isPhotoLoading || isPhotoProcessing) && (
            <View style={s.loaderOverlay}>
              <ActivityIndicator size="small" color="#111827" />
            </View>
          )}
        </Pressable>

        {variant === 'hero' && (
          <View style={s.heroActions}>
            <Pressable
              style={[s.heroButton, s.heroButtonSecondary]}
              onPress={pickFromGallery}
              disabled={isPhotoLoading || isPhotoProcessing}
            >
              <MaterialIcons name="photo-camera" size={22} color="#3B4E77" />
              <Text style={[s.heroButtonText, s.heroButtonTextSecondary]}>
                Change Photo
              </Text>
            </Pressable>

            <Pressable
              style={[s.heroButton, s.heroButtonPrimary]}
              onPress={takeFromCamera}
              disabled={isPhotoLoading || isPhotoProcessing}
            >
              <MaterialIcons name="photo-camera" size={22} color="#fff" />
              <Text style={[s.heroButtonText, s.heroButtonTextPrimary]}>
                Take Photo
              </Text>
            </Pressable>
          </View>
        )}
      </View>

      <BottomModal
        visible={isSourceModalVisible}
        onClose={() => setIsSourceModalVisible(false)}
        isLoading={isPhotoLoading || isPhotoProcessing}
      >
        <View style={s.modalCard}>
          <Pressable
            style={s.modalAction}
            onPress={takeFromCamera}
            disabled={isPhotoLoading || isPhotoProcessing}
          >
            <Text style={s.modalActionText}>{t('welcome.takePhoto')}</Text>
          </Pressable>
          <Pressable
            style={s.modalAction}
            onPress={pickFromGallery}
            disabled={isPhotoLoading || isPhotoProcessing}
          >
            <Text style={s.modalActionText}>
              {t('welcome.pickFromGallery')}
            </Text>
          </Pressable>
          <Pressable
            style={s.modalCancel}
            onPress={() => setIsSourceModalVisible(false)}
          >
            <Text style={s.modalCancelText}>{t('common.cancel')}</Text>
          </Pressable>
        </View>
      </BottomModal>
    </>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderColor: Colors.light.border,
  },
  heroCard: {
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 16,
    backgroundColor: '#FAFBFF',
  },
  heroTitle: {
    color: '#33456A',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 14,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  muted: { color: '#6B7280' },
  placeholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  placeholderCta: { color: '#111827', fontWeight: '700' },
  clearBtn: {
    marginTop: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFE4E6',
  },
  clearBtnText: { color: '#991B1B', fontWeight: '700' },

  previewFrame: {
    width: '100%',
    height: height * 0.3,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPreviewFrame: {
    borderRadius: 0,
    height: height * 0.58,
    backgroundColor: '#EEF0F7',
  },
  preview: { width: '100%', height: '100%' },
  loaderOverlay: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 999,
    padding: 6,
  },
  modalCard: {
    gap: 8,
  },
  modalAction: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  modalActionText: { color: '#111827', fontWeight: '700' },
  modalCancel: {
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#FFE4E6',
  },
  modalCancelText: { color: '#991B1B', fontWeight: '700' },
  heroActions: {
    marginTop: -38,
    marginBottom: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroButton: {
    borderRadius: 999,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: '46%',
    justifyContent: 'center',
    shadowColor: '#1C2B4A',
    shadowOpacity: 0.16,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  heroButtonSecondary: {
    backgroundColor: '#FFFFFF',
  },
  heroButtonPrimary: {
    backgroundColor: '#1964E8',
  },
  heroButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
  heroButtonTextPrimary: {
    color: '#fff',
  },
  heroButtonTextSecondary: {
    color: '#3B4E77',
  },
});

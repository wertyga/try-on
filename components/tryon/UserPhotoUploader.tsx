import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';
import { useTryOnStore } from '@/stores/useTryOnStore';
import { BottomModal } from '@/components/ui/BottomModal';
import { HeroImage } from '@/components/ui/HeroImage';

const { height } = Dimensions.get('window');

type UserPhotoUploaderProps = {
  title?: string;
};

export function UserPhotoUploader({ title }: UserPhotoUploaderProps) {
  const [isPhotoLoading, setIsPhotoLoading] = useState(false);
  const [isPhotoProcessing, setIsPhotoProcessing] = useState(false);
  const [isSourceModalVisible, setIsSourceModalVisible] = useState(false);
  const { t } = useTranslation();

  const { userPhoto, setUserPhoto } = useTryOnStore();
  const isHero = true;
  const ctaLabel = userPhoto
    ? `${t('common.edit')} ${t('home.yourPhoto')}`
    : t('home.addPhoto');

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
      <View
        style={{
          width: '100%',
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'center',
          height: height * 0.4,
          maxHeight: height * 0.4,
        }}
      >
        <View style={[s.card, isHero && s.heroCard]}>
          {!!title && <Text style={s.cardTitle}>{title}</Text>}

          <Pressable
            style={[s.previewFrame, isHero && s.heroPreviewFrame]}
            onPress={() => setIsSourceModalVisible(true)}
            disabled={isPhotoLoading || isPhotoProcessing}
          >
            {userPhoto ? (
              <HeroImage
                imageUri={userPhoto.uri}
                isLoading={isPhotoLoading || isPhotoProcessing}
              />
            ) : (
              <View style={[s.placeholder, isHero && s.heroPlaceholder]}>
                <View style={[s.placeholderIconWrap, isHero && s.heroIconWrap]}>
                  <MaterialIcons
                    name="add-a-photo"
                    size={isHero ? 30 : 24}
                    color="#4B5563"
                  />
                </View>
                <Text style={[s.muted, isHero && s.heroMuted]}>
                  {t('home.noPhoto')}
                </Text>
                <Text style={s.placeholderCta}>{t('home.addPhoto')}</Text>
              </View>
            )}

            {!isHero && (isPhotoLoading || isPhotoProcessing) && (
              <View style={s.loaderOverlay}>
                <ActivityIndicator size="small" color="#111827" />
              </View>
            )}

            {isHero && (
              <View style={s.heroButtonWrap}>
                <View style={s.heroButton}>
                  <MaterialIcons
                    name="photo-camera"
                    size={18}
                    color="#374151"
                  />
                  <Text style={s.heroButtonText}>{ctaLabel}</Text>
                </View>
              </View>
            )}
          </Pressable>
        </View>
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
    width: '100%',
    maxWidth: 700,
  },
  heroCard: {
    borderRadius: 24,
    padding: 12,
    marginBottom: 18,
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 4,
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
  heroPlaceholder: {
    gap: 10,
  },
  placeholderIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
  },
  heroIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFFFFFD9',
  },
  placeholderCta: { color: '#111827', fontWeight: '700' },
  heroMuted: {
    fontSize: 15,
  },
  previewFrame: {
    width: '100%',
    flex: 1,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPreviewFrame: {
    height: '100%',
    borderRadius: 24,
    backgroundColor: '#EFE9E2',
    borderWidth: 1,
    borderColor: '#F2F0EC',
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
  heroButtonWrap: {
    position: 'absolute',
    bottom: 14,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  heroButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: '#FFFFFFF2',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  heroButtonText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '700',
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
});

import React, { useCallback, useState } from 'react';
import { Alert, StyleProp, ViewStyle } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import Toast from 'react-native-toast-message';
import { MaterialIcons } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';

export type DownloadImageButtonProps = {
  imageUrl?: string;
  fileName?: string;
  style?: StyleProp<ViewStyle>;
  albumName?: string; // опционально
};

const getExtFromUrl = (url: string) => {
  const clean = url.split('?')[0].split('#')[0];
  const ext = clean.split('.').pop()?.toLowerCase();
  return ext && ext.length <= 5 ? ext : 'jpg';
};

export const DownloadImageButton: React.FC<DownloadImageButtonProps> = ({
  imageUrl,
  fileName = 'tryon.jpg',
  style,
  albumName = 'TryOn',
}) => {
  const { t } = useTranslation();
  const [saving, setSaving] = useState(false);

  const ensurePermission = useCallback(async () => {
    const perm = await MediaLibrary.getPermissionsAsync();
    if (perm.granted) return true;

    const req = await MediaLibrary.requestPermissionsAsync();
    return req.granted;
  }, []);

  const handleDownload = useCallback(async () => {
    if (!imageUrl || saving) return;

    setSaving(true);
    try {
      // const hasPermission = await ensurePermission();
      // if (!hasPermission) {
      //   Alert.alert(
      //     t('permissions.required'),
      //     Platform.OS === 'ios'
      //       ? t('permissions.photos.ios')
      //       : t('permissions.photos.android'),
      //   );
      //   return;
      // }

      const ext = getExtFromUrl(imageUrl);
      const normalizedFileName = fileName.includes('.')
        ? fileName
        : `${fileName}.${ext}`;

      const downloadTarget = `${FileSystem.cacheDirectory}${normalizedFileName}`;

      const { uri } = await FileSystem.downloadAsync(imageUrl, downloadTarget);

      // ✅ сохраняем в Фото
      const asset = await MediaLibrary.createAssetAsync(uri);

      // (опционально) положить в альбом TryOn
      try {
        await MediaLibrary.createAlbumAsync(albumName, asset, false);
      } catch {
        // альбом может уже существовать / ОС может отказать — не критично,
        // asset уже в библиотеке
      }

      Toast.show({
        type: 'success',
        text1: t('common.savedToPhotos'),
      });
    } catch (e) {
      Alert.alert(t('common.error'), t('errors.saveImageFailed'));
    } finally {
      setSaving(false);
    }
  }, [albumName, ensurePermission, fileName, imageUrl, saving, t]);

  return (
    <Button
      dark
      onPress={handleDownload}
      disabled={!imageUrl}
      isLoading={saving}
      style={[
        {
          width: 50,
          height: 50,
          paddingHorizontal: 0,
        },
        style,
      ]}
    >
      <MaterialIcons name="download" size={24} color="#fff" />
    </Button>
  );
};

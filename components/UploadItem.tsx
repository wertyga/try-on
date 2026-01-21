import { View, StyleSheet, Pressable, Image, Text } from 'react-native';

import { useTranslation } from 'react-i18next';

export function UploadItem({
  title,
  imageUri,
  onPick,
  onClear,
}: {
  title: string;
  imageUri?: string;
  onPick: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>

      <Pressable style={s.previewFrame} onPress={onPick}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={s.preview}
            resizeMode="contain"
          />
        ) : (
          <Text style={s.placeholderText}>{t('garnet.clickUpload')}</Text>
        )}
      </Pressable>

      {imageUri && (
        <Pressable style={s.clearBtn} onPress={onClear}>
          <Text style={s.clearBtnText}>{t('garnet.clear')}</Text>
        </Pressable>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 8 },
  switchRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  switchBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  switchBtnActive: { backgroundColor: '#111827' },
  switchText: { color: '#111827', fontWeight: '700' },
  switchTextActive: { color: '#fff' },

  card: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },

  previewFrame: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '100%', height: '100%' },
  placeholderText: { color: '#6B7280', fontWeight: '600' },

  clearBtn: {
    backgroundColor: '#FFE4E6',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  clearBtnText: { color: '#991B1B', fontWeight: '700' },

  hint: { color: '#6B7280', marginTop: 4 },
});

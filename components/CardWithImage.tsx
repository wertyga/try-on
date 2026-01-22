import { Image, StyleSheet, Text, View } from 'react-native';
import React, { FC } from 'react';
import { Colors } from '@/constants/Colors';

export type TCardWithImageProps = {
  uris: (string | null | undefined)[];
  uriTitles?: (string | null | undefined)[];
  title: string;
  chipTitle?: string;
  chipMode?: 'dark' | 'light';
  notSelectedText: string;
};

export const CardWithImage: FC<TCardWithImageProps> = ({
  uris,
  chipMode,
  title,
  chipTitle,
  notSelectedText,
  uriTitles = [],
}) => {
  const isMultiple = uris.length > 1;
  const images = uris.filter((im) => !!im);

  return (
    <View style={s.container}>
      <View style={s.rowBetween}>
        <Text style={[s.itemTitle]}>{title}</Text>

        {!!chipTitle && (
          <View
            style={[s.chip, chipMode === 'dark' ? s.chipDark : s.chipLight]}
          >
            <Text
              style={chipMode === 'dark' ? s.chipTextDark : s.chipTextLight}
            >
              {chipTitle}
            </Text>
          </View>
        )}
      </View>

      {!images.length && (
        <View style={s.previewFrameWide}>
          <Text style={s.muted}>{notSelectedText}</Text>
        </View>
      )}

      {!!images.length && (
        <View style={[isMultiple && !!uris[0] && s.separateWrap]}>
          {images.map((uri, i) => {
            return (
              <View
                style={[isMultiple && s.separateCard]}
                key={(uri ?? '') + i}
              >
                {!!uriTitles[i] && (
                  <Text style={s.itemTitle}>{uriTitles[i]}</Text>
                )}
                <View
                  style={isMultiple ? s.previewFrameSmall : s.previewFrameWide}
                >
                  <Image
                    source={{ uri: uri as string }}
                    style={s.preview}
                    resizeMode="contain"
                  />
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

const s = StyleSheet.create({
  container: {
    aspectRatio: 1,
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  item: {
    flex: 1,
  },

  separateWrap: { flexDirection: 'row', gap: 12 },
  separateCard: { flex: 1 },

  previewFrameWide: {
    flex: 1,
    minHeight: 205,
    borderRadius: 12,
    backgroundColor: Colors.light.disabledBg,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewFrameSmall: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: Colors.light.disabledBg,
    overflow: 'hidden',
  },
  preview: { width: '100%', height: '100%' },

  muted: { color: Colors.light.textDisabled },

  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },

  mutedSmall: { color: '#9CA3AF', fontSize: 12 },

  itemTitle: { fontSize: 15, fontWeight: '700' },

  chip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 999 },
  chipDark: { backgroundColor: '#111827' },
  chipLight: { backgroundColor: '#E5E7EB' },
  chipTextDark: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chipTextLight: { color: '#111827', fontWeight: '700', fontSize: 12 },
});

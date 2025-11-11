import React, { useMemo } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Share,
  Platform,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { TProduct } from '@/types';

type Props = {
  product: TProduct;
  onOpen?: (p: TProduct) => void;
  onShare?: (p: TProduct) => void;
};

const FALLBACK_IMG =
  'https://dummyimage.com/800x600/eeeeee/999999.jpg&text=No+image';

function truncate(s?: string | null, max = 160) {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max - 1) + '…' : t;
}

export const ProductCard: React.FC<Props> = ({ product, onOpen, onShare }) => {
  const { title, description, imageUrl, deepLink, categories = [] } = product;

  const tags = useMemo(
    () => categories.map((c) => c.title).slice(0, 3),
    [categories],
  );

  async function openAffiliate() {
    try {
      // откроем во встроенном браузере, чтобы не терять реферрер
      const result = await WebBrowser.openBrowserAsync(deepLink, {
        // на Android Custom Tabs, на iOS SFSafariViewController
        dismissButtonStyle: 'close',
        presentationStyle: WebBrowser.WebBrowserPresentationStyle.PAGE_SHEET,
      });
      onOpen?.(product);
      return result;
    } catch (e) {
      // на всякий случай откроем системным способом
      onOpen?.(product);
    }
  }

  async function shareLink() {
    try {
      await Share.share({
        title,
        message:
          Platform.OS === 'ios'
            ? `${title}\n${deepLink}`
            : `${title} — ${deepLink}`,
        url: deepLink, // iOS использует url отдельно
      });
      onShare?.(product);
    } catch {}
  }

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Pressable
          onPress={openAffiliate}
          android_ripple={{ color: '#e5e7eb' }}
        >
          <Image
            source={{ uri: imageUrl || FALLBACK_IMG }}
            style={styles.image}
            resizeMode="cover"
          />
        </Pressable>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {!!description && (
          <Text style={styles.desc} numberOfLines={5}>
            {truncate(description, 180)}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {!!tags.length && (
          <View style={styles.tagsRow}>
            {tags.map((t) => (
              <View key={t} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          <Pressable
            style={[styles.btn, styles.primary]}
            onPress={openAffiliate}
          >
            <Text style={[styles.btnText, styles.primaryText]}>Shop now</Text>
          </Pressable>

          <Pressable style={[styles.btn, styles.ghost]} onPress={shareLink}>
            <Text style={[styles.btnText, styles.ghostText]}>Share</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2, // android shadow
    shadowColor: '#000', // ios shadow
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    marginVertical: 8,
    flex: 1,
    justifyContent: 'space-between',
    width: 280,
    height: 450,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    objectFit: 'contain',
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 14,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  desc: {
    fontSize: 13,
    lineHeight: 18,
    color: '#4b5563',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
  },
  tagText: {
    fontSize: 11,
    color: '#374151',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  btn: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  primary: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  primaryText: {
    color: '#ffffff',
  },
  ghost: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
  },
  ghostText: {
    color: '#111827',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});

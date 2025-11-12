import React, { useState } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import * as Localization from 'expo-localization';
import { fetchPreferredProducts, sendLogs } from '@/api';
import { storage } from '@/utils';
import { TProduct } from '@/types';
import { useFocus } from '@/hooks';
import { ProductCard } from '@/components/ReccomendationProducts/ProductCard';

export const ReccomendationProducts = () => {
  const [products, setProducts] = useState<TProduct[]>([]);

  const getProducts = async () => {
    const categories = await storage.preferredProductCategories;

    if (!categories?.length) return;

    const zone = Localization.getLocales()?.[0]?.regionCode ?? 'US';

    try {
      const products = await fetchPreferredProducts({
        categories,
        zone,
        limit: 30,
      });
      setProducts(products);
    } catch (e) {
      sendLogs({ place: 'ReccomendationProducts.getProducts', e });
    }
  };

  useFocus(() => {
    getProducts();
  }, []);

  if (!products.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recommended for you</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((p) => (
          <View key={p._id} style={styles.cardWrapper}>
            <ProductCard product={p} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  cardWrapper: {
    marginRight: 12,
  },
});

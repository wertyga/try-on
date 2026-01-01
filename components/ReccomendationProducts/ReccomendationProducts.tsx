import React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { useFocus } from '@/hooks';
import { ProductCard } from '@/components/ReccomendationProducts/ProductCard';
import { useProductsStore } from '@/stores';

export const ReccomendationProducts = () => {
  const { fetchProductsByInnerCategories, recommendedProducts } =
    useProductsStore();

  useFocus(() => {
    fetchProductsByInnerCategories();
  }, []);

  if (!recommendedProducts.length) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Recommended for you</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {recommendedProducts.map((p) => (
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

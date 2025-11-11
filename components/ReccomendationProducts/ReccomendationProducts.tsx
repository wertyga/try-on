import { ScrollView, Text } from 'react-native';
import { useEffect, useState } from 'react';
import { fetchPreferredProducts } from '@/api';
import { storage } from '@/utils';
import { TProduct } from '@/types';
import * as Localization from 'expo-localization';

export const ReccomendationProducts = () => {
  const [products, setProducts] = useState<TProduct[]>([]);

  const getProducts = async () => {
    const categories = await storage.preferredProductCategories;
    console.log({ Localization: Localization.getLocales() });
    if (!categories?.length) return;

    const products = await fetchPreferredProducts({
      categories,
      zone: 'US',
      limit: 30,
    });

    setProducts(products);
  };

  console.log({ products });

  useEffect(() => {
    getProducts();
  }, []);

  if (!products.length) return null;

  return (
    <ScrollView>
      <Text>ReccomendationProducts</Text>
    </ScrollView>
  );
};

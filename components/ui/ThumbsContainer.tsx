import { ScrollView, StyleSheet, Text, View } from 'react-native';
import React from 'react';
import { Colors } from '@/constants/Colors';
import { LoaderOverlay } from '@/components/Loader';

export type TThumbsContainerProps = {
  title?: string;
  children: any;
  isLoading?: boolean;
  loadingTitle?: string;
  loadingSubtitle?: string;
};

export const ThumbsContainer = ({
  title,
  children,
  isLoading = false,
  loadingTitle,
  loadingSubtitle,
}: TThumbsContainerProps) => {
  return (
    <View style={s.card}>
      <Text style={s.cardTitle}>{title}</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.list}
      >
        {children}
      </ScrollView>

      {isLoading && (
        <LoaderOverlay title={loadingTitle} subtitle={loadingSubtitle} />
      )}
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    backgroundColor: Colors.light.cardBg,
    paddingHorizontal: 16,
    paddingBottom: 14,
    paddingTop: 10,
    marginBottom: 16,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    marginBottom: 8,
    color: Colors.light.text,
    fontSize: 15,
    fontWeight: '800',
    paddingHorizontal: 0,
  },
  list: {
    gap: 10,
  },
});

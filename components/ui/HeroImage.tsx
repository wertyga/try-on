import React from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
  ImageStyle,
} from 'react-native';

type HeroImageProps = {
  imageUri: string;
  isLoading?: boolean;
  backgroundVariant?: 'warm' | 'gray';
  style?: StyleProp<ViewStyle>;
  imageStyle?: StyleProp<ImageStyle>;
};

const { height } = Dimensions.get('window');

export function HeroImage({
  imageUri,
  isLoading = false,
  backgroundVariant = 'warm',
  style,
  imageStyle,
}: HeroImageProps) {
  return (
    <View
      style={[
        s.previewFrame,
        backgroundVariant === 'gray' && s.previewFrameGray,
        style,
      ]}
    >
      <Image
        source={{ uri: imageUri }}
        style={[s.preview, imageStyle]}
        resizeMode="contain"
      />

      {isLoading && (
        <View style={s.loaderOverlay}>
          <ActivityIndicator size="small" color="#111827" />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  previewFrame: {
    width: '100%',
    maxWidth: 700,
    borderRadius: 24,
    backgroundColor: '#EFE9E2',
    borderWidth: 1,
    borderColor: '#F2F0EC',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    height: height * 0.4,
    maxHeight: height * 0.4,
  },
  previewFrameGray: {
    backgroundColor: '#E5E7EB',
    borderColor: '#D1D5DB',
  },
  preview: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  loaderOverlay: {
    position: 'absolute',
    right: 10,
    top: 10,
    backgroundColor: '#FFFFFFCC',
    borderRadius: 999,
    padding: 6,
  },
});

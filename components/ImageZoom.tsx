import {
  Image,
  type ImageProps,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, { FC, useState } from 'react';

export const ImageZoom: FC<
  ImageProps & { imageStyle?: ImageProps['style'] }
> = ({ style, imageStyle, ...props }) => {
  const [preview, setPreview] = useState<boolean>(false);

  return (
    <>
      <Pressable onPress={() => setPreview(true)} style={[s.heroWrap, style]}>
        <Image style={[s.hero, imageStyle]} {...props} />
      </Pressable>

      {preview && (
        <Modal visible transparent onRequestClose={() => setPreview(false)}>
          <Pressable style={s.modal} onPress={() => setPreview(false)}>
            {preview && (
              <Image style={s.preview} resizeMode="contain" {...props} />
            )}
          </Pressable>
        </Modal>
      )}
    </>
  );
};
const s = StyleSheet.create({
  heroWrap: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  hero: { width: '100%', height: '100%' },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '90%', height: '90%' },
});

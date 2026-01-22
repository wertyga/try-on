import {
  Image,
  type ImageProps,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import React, { FC, useState } from 'react';
import { DownloadImageButton } from '@/components/DownloadImageButton';

export const ImageZoom: FC<
  ImageProps & { imageStyle?: ImageProps['style']; withDownload?: boolean }
> = ({ style, imageStyle, withDownload, ...props }) => {
  const [preview, setPreview] = useState<boolean>(false);

  const isWithDownload = withDownload && (props.source as any)?.uri;

  return (
    <>
      <Pressable onPress={() => setPreview(true)} style={[s.heroWrap, style]}>
        <Image style={[s.hero, imageStyle]} {...props} />
        {isWithDownload && (
          <DownloadImageButton
            imageUrl={(props.source as any).uri}
            style={s.dwnload}
          />
        )}
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
  hero: { height: '100%', width: '100%' },

  modal: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  preview: { width: '90%', height: '90%' },

  dwnload: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
});

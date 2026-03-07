import React, { FC, ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

export const BottomModal: FC<BottomModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={s.backdrop} onPress={onClose}>
        <Pressable style={s.sheet} onPress={() => {}}>
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: '#00000055',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '80%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 12,
  },
});

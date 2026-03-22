import React, { FC, ReactNode, useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
};

const CLOSE_DISTANCE = 80;
const CLOSE_VELOCITY = 900;
const SHEET_CLOSE_OFFSET = Dimensions.get('window').height;

export const BottomModal: FC<BottomModalProps> = ({
  visible,
  onClose,
  children,
}) => {
  const { height } = useWindowDimensions();

  const translateY = useSharedValue(SHEET_CLOSE_OFFSET);

  useEffect(() => {
    if (visible) {
      translateY.value = SHEET_CLOSE_OFFSET;
      translateY.value = withTiming(0, { duration: 220 });
    }
  }, [translateY, visible]);

  const panGesture = Gesture.Pan()
    .activeOffsetY(8)
    .failOffsetX([-20, 20])
    .onUpdate((event) => {
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      const shouldClose =
        event.translationY > CLOSE_DISTANCE || event.velocityY > CLOSE_VELOCITY;

      if (shouldClose) {
        translateY.value = withTiming(
          SHEET_CLOSE_OFFSET,
          { duration: 180 },
          (finished) => {
            if (finished) {
              runOnJS(onClose)();
            }
          },
        );
        return;
      }

      translateY.value = withSpring(0, {
        damping: 18,
        stiffness: 180,
      });
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={[s.root]}>
        <Pressable style={s.backdrop} onPress={onClose} />

        <View style={[s.sheetWrap]} pointerEvents="box-none">
          <GestureDetector gesture={panGesture}>
            <Animated.View
              style={[
                s.sheet,
                { maxHeight: height * 0.9, minHeight: height * 0.6 },
                sheetStyle,
              ]}
            >
              <View style={s.handleWrap}>
                <View style={s.handle} />
              </View>

              <ScrollView style={s.content}>{children}</ScrollView>
            </Animated.View>
          </GestureDetector>
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#00000055',
  },
  sheetWrap: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  sheet: {
    minHeight: 120,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 8,
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
  },
  content: {
    flexShrink: 1,
    minHeight: 0,
    padding: 12,
  },
});

import React, { FC, ReactNode, useEffect } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import { Colors } from '@/constants/Colors';

type BottomModalProps = {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
};

const CLOSE_DISTANCE = 80;
const CLOSE_VELOCITY = 900;
const SHEET_CLOSE_OFFSET = Dimensions.get('window').height;

export const BottomModal: FC<BottomModalProps> = ({
  visible,
  onClose,
  children,
  isLoading = false,
  style,
}) => {
  const { t } = useTranslation();
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
      if (isLoading) return;
      translateY.value = Math.max(0, event.translationY);
    })
    .onEnd((event) => {
      if (isLoading) {
        translateY.value = withSpring(0, {
          damping: 18,
          stiffness: 180,
        });
        return;
      }

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
      onRequestClose={isLoading ? undefined : onClose}
    >
      <View style={[s.root, style]}>
        <Pressable
          style={s.backdrop}
          onPress={isLoading ? undefined : onClose}
          disabled={isLoading}
        />

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

              {isLoading ? (
                <View style={s.loadingOverlay}>
                  <ActivityIndicator size="large" />
                  <Text style={s.loadingText}>{t('common.loading')}</Text>
                </View>
              ) : null}
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
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.78)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 8,
    color: Colors.light.text,
  },
});

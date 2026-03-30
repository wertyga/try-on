import { FC, ReactNode } from 'react';
import {
  Pressable,
  PressableProps,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';

export type TButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  transparent?: boolean;
  flexEnd?: boolean;
  flexStart?: boolean;
  fullWidth?: boolean;
  isLoading?: boolean;
  dark?: boolean;
};

export const Button: FC<TButtonProps> = ({
  children,
  style,
  transparent,
  flexStart,
  flexEnd,
  fullWidth,
  isLoading,
  disabled: disabledProp,
  dark,
  ...pressableProps
}) => {
  const disabled = !!isLoading || !!disabledProp;
  const isStringChild = typeof children === 'string';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      style={({ pressed }) => [
        s.container,
        transparent ? s.transparent : s.solid,
        fullWidth && s.fullWidth,
        flexEnd && s.flexEnd,
        flexStart && s.flexStart,
        disabled && (transparent ? s.disabledTransparent : s.disabled),
        pressed && !disabled && s.pressed,
        style,
      ]}
      {...pressableProps}
    >
      {isStringChild ? (
        <Text
          style={[
            s.text,
            dark ? s.darkTextTheme : s.lightTextTheme,
            transparent && s.textTransparent,
            disabled &&
              (transparent ? s.textDisabledTransparent : s.textDisabled),
            isLoading && s.loadingText,
          ]}
        >
          {children as string}
        </Text>
      ) : (
        children
      )}

      {isLoading && (
        <ActivityIndicator
          color={transparent ? Colors.light.text : '#fff'}
          style={StyleSheet.absoluteFill}
        />
      )}
    </Pressable>
  );
};

const s = StyleSheet.create({
  container: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
  },

  solid: { backgroundColor: Colors.light.btnBg },
  transparent: { backgroundColor: 'transparent', minHeight: 30 },

  fullWidth: { width: '100%' },
  flexEnd: { justifyContent: 'flex-end' },
  flexStart: { justifyContent: 'flex-start' },

  // states
  pressed: { opacity: 0.88 },
  disabled: { backgroundColor: Colors.light.disabledBg },
  disabledTransparent: { opacity: 0.5 },

  // text
  text: { fontWeight: 600, fontSize: 16, letterSpacing: 0.2 },
  textTransparent: { color: Colors.light.text },
  textDisabled: { color: Colors.light.textDisabled },
  textDisabledTransparent: { color: Colors.light.textDisabled },
  loadingText: { opacity: 0 }, // прячем текст под лоадер

  darkTextTheme: {
    color: Colors.light.textLight,
  },
  lightTextTheme: {
    color: Colors.light.text,
  },
});

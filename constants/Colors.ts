/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#D3B08B';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#2F2A25',
    textLight: '#ffffff',
    textDisabled: '#9D9288',
    btnBg: '#D3B08B',
    background: '#F4F1EE',
    cardBg: '#FFFCF9',
    border: '#E9E0D8',
    disabledBg: '#E9E0D8',
    tint: tintColorLight,
    icon: '#9D9288',
    tabIconDefault: '#9D9288',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

import { StyleProp, ViewStyle } from 'react-native';

type TStyleToBuild =
  | StyleProp<ViewStyle>
  | StyleProp<ViewStyle[]>
  | undefined
  | null;

export const buildStyles = (
  ...params: TStyleToBuild[]
): StyleProp<ViewStyle>[] => {
  return params.reduce(
    (acc, s) => {
      if (Array.isArray(s)) {
        return [...(acc as any), ...s].filter(Boolean);
      }

      return [...(acc as any), s].filter(Boolean);
    },
    [] as StyleProp<ViewStyle[]>,
  ) as StyleProp<ViewStyle>[];
};

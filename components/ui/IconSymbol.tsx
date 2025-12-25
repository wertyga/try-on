import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

export type TIconSymbolProps = {
  name: ComponentProps<typeof MaterialIcons>['name'];
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
};
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: TIconSymbolProps) {
  return <MaterialIcons color={color} size={size} name={name} style={style} />;
}

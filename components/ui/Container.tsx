import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import React, { FC, ReactNode } from 'react';
import { Colors } from '@/constants/Colors';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LoaderOverlay } from '@/components/Loader';
import { buildStyles } from '@/utils';

export type TContainerProps = ScrollViewProps & {
  children: ReactNode;
  title?: string;
  isLoading?: boolean;
  childrenStyle?: StyleProp<ViewStyle>;
};

const Title: FC<{ title: string }> = ({ title }) => {
  return <Text style={s.title}>{title}</Text>;
};

const ScrollContent = ({
  style,
  contentContainerStyle,
  title,
  isLoading,
  children,
  childrenStyle,
  ...scrollViewProps
}: TContainerProps) => {
  const insets = useSafeAreaInsets();

  return (
    <ScrollView
      style={buildStyles(s.container, style)}
      contentContainerStyle={buildStyles(
        s.content,
        { paddingTop: insets.top },
        contentContainerStyle,
      )}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
      {!!title && <Title title={title} />}

      <View style={[{ width: '100%', flex: 1 }, childrenStyle]}>
        {children}
      </View>

      {isLoading && <LoaderOverlay />}
    </ScrollView>
  );
};

export const Container = ({
  children,
  contentContainerStyle,
  ...props
}: TContainerProps) => {
  return (
    <ScrollContent
      {...props}
      contentContainerStyle={[{ paddingBottom: 16 }, contentContainerStyle]}
    >
      {children}
    </ScrollContent>
  );
};

const ScrollableContainerWithTabs: FC<TContainerProps> = ({
  children,
  contentContainerStyle,
  ...props
}) => {
  const tabBarHeight = useBottomTabBarHeight();

  return (
    <ScrollContent
      {...props}
      contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}
    >
      {children}
    </ScrollContent>
  );
};

Container.WithTabBar = ScrollableContainerWithTabs;

const s = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800', marginBottom: 16 },
  content: { padding: 16, flexGrow: 1 },
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});

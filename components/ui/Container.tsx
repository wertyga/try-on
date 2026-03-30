import {
  ScrollView,
  ScrollViewProps,
  StyleSheet,
  Text,
  View,
  StyleProp,
  ViewStyle,
  Platform,
} from 'react-native';
import React, { FC, ReactNode } from 'react';
import { Colors } from '@/constants/Colors';
import { LoaderOverlay } from '@/components/Loader';
import { buildStyles } from '@/utils';

export type TContainerProps = ScrollViewProps & {
  children: ReactNode;
  title?: string;
  isLoading?: boolean;
  childrenStyle?: StyleProp<ViewStyle>;
};

const Title: FC<{ title: string }> = ({ title }) => <Text style={s.title}>{title}</Text>;

const ScrollContent = ({
  style,
  contentContainerStyle,
  title,
  isLoading,
  children,
  childrenStyle,
  ...scrollViewProps
}: TContainerProps) => {
  return (
    <ScrollView
      style={buildStyles(s.container, style)}
      contentContainerStyle={buildStyles(s.content, contentContainerStyle)}
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
  return (
    <ScrollContent
      {...props}
      contentContainerStyle={Platform.select({
        android: {
          paddingBottom: 32,
        },
        ios: {
          paddingBottom: 16,
        },
      })}
    >
      {children}
    </ScrollContent>
  );
};

Container.WithTabBar = ScrollableContainerWithTabs;

const s = StyleSheet.create({
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '500',
    marginBottom: 18,
    color: Colors.light.text,
    letterSpacing: 0.2,
  },
  content: { paddingHorizontal: 16, flexGrow: 1 },
  container: {
    paddingTop: 12,
    paddingHorizontal: 8,
    flex: 1,
    backgroundColor: Colors.light.background,
  },
});

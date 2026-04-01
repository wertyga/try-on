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

const Header = ({ title }: { title: string }) => {
  return (
    <View style={s.header}>
      <Text style={s.title}>{title}</Text>
    </View>
  );
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
  return (
    <ScrollView
      style={buildStyles(s.scroll, style)}
      contentContainerStyle={buildStyles(s.content, contentContainerStyle)}
      showsVerticalScrollIndicator={false}
      {...scrollViewProps}
    >
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
    <View style={s.container}>
      {!!props.title && <Header title={props.title} />}

      <ScrollContent
        {...props}
        contentContainerStyle={[{ paddingBottom: 16 }, contentContainerStyle]}
      >
        {children}
      </ScrollContent>
    </View>
  );
};

const ScrollableContainerWithTabs: FC<TContainerProps> = ({
  children,
  contentContainerStyle,
  ...props
}) => {
  return (
    <View style={s.container}>
      {!!props.title && <Header title={props.title} />}

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
    </View>
  );
};

Container.WithTabBar = ScrollableContainerWithTabs;

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    backgroundColor: Colors.light.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: {
    color: Colors.light.text,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  scroll: {
    flex: 1,
    paddingTop: 16,
    paddingHorizontal: 0,
    backgroundColor: Colors.light.background,
  },
  content: { paddingHorizontal: 16, flexGrow: 1 },
});

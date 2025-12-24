import { StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';
import { FC } from 'react';
import useCreditsStore from '@/stores/useCreditsStore';

export const StripeProvider: FC<{ children: any }> = ({ children }) => {
  const { publishableKey } = useCreditsStore();

  return (
    <RNStripeProvider publishableKey={publishableKey}>
      {children}
    </RNStripeProvider>
  );
};

import { StripeProvider as RNStripeProvider } from '@stripe/stripe-react-native';
import { FC } from 'react';
import { useStripeStore } from './stripe.slice';

export const StripeProvider: FC<{ children: any }> = ({ children }) => {
  const { publishableKey } = useStripeStore();

  return (
    <RNStripeProvider publishableKey={publishableKey}>
      {children}
    </RNStripeProvider>
  );
};

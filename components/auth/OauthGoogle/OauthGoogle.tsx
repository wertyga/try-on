import { StyleSheet, Text } from 'react-native';

import { FontAwesome } from '@expo/vector-icons';

import { Button } from '@/components/ui/button';

import { FONTS } from '@/types';
import { useAuthStore } from '@/stores';

const OauthGoogle = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { isLoading, signInWithGoogle } = useAuthStore();

  const signIn = async () => {
    await signInWithGoogle(onSuccess);
  };

  return (
    <Button
      onPress={signIn}
      style={styles.container}
      isLoading={isLoading}
      dark
    >
      <FontAwesome name="google" size={28} color="white" />
      <Text style={styles.text}>Sign in with Google</Text>
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {},
  text: {
    marginLeft: 10,
    fontFamily: FONTS.OpenSansSemiBold,
    color: 'white',
    fontWeight: 700,
  },
});

export default OauthGoogle;

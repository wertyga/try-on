import { StyleSheet, Text } from 'react-native';

import Toast from 'react-native-toast-message';

import { FontAwesome } from '@expo/vector-icons';

import { sendLogs } from '@/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';

const OauthGoogle = () => {
  const { registerWithGoogle, isLoading } = useAuthStore();

  const signIn = async () => {
    try {
      GoogleSignin.configure();

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const {
        data: { user },
      } = (await GoogleSignin.signIn()) as any;

      await registerWithGoogle({ email: user.email, username: user.name });

      router.replace('/try-on');
    } catch (e: any) {
      sendLogs(e);
      Toast.show({
        type: 'error',
        text1: e.message,
      });
    }
  };

  return (
    <Button onPress={signIn} disabled={isLoading}>
      <FontAwesome name="google" size={24} color="white" />
      <Text style={styles.text}>Sign in with Google</Text>
    </Button>
  );
};

const styles = StyleSheet.create({
  container: {},
  text: {
    marginLeft: 10,
    color: 'white',
    fontWeight: '600',
  },
});

export default OauthGoogle;

import { StyleSheet, Text } from 'react-native';

import Toast from 'react-native-toast-message';

import { FontAwesome } from '@expo/vector-icons';

import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useAuthStore } from '@/hooks/useAuthStore';
import { Button } from '@/components/ui/button';
import { router } from 'expo-router';
import { Analytics } from '@/analytics';

const OauthGoogle = () => {
  const { registerWithGoogle, isLoading } = useAuthStore();

  const signIn = async () => {
    try {
      Analytics.event('login_google_start');

      GoogleSignin.configure();

      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
      const {
        data: { user: gUser },
      } = (await GoogleSignin.signIn()) as any;

      const user = await registerWithGoogle({
        email: gUser.email,
        username: gUser.name,
      });

      await Analytics.event('login_google_success');
      await Analytics.userId(user._id);
      await Analytics.userProp('auth', 'user');

      router.replace('/try-on');
    } catch (e: any) {
      Analytics.event('login_google_error', {
        code: e.code || 'unknown',
        message: e.message,
      });

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

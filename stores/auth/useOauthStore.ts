import { create } from 'zustand';

import { oauthGoogleRegister, oauthAppleRegister } from '@/api/auth.api';

import {
  GoogleSignin,
  type User as TGoogle,
} from '@react-native-google-signin/google-signin';
import * as AppleAuthentication from 'expo-apple-authentication';
import { TUser } from '@/types';

type TAuthStore = {
  appleLogout: () => Promise<void>;
  clear: () => Promise<void>;
  getAppleCredential: () => Promise<AppleAuthentication.AppleAuthenticationCredential>;
  getGoogleUser: () => Promise<TGoogle['user']>;
  googleLogout: () => Promise<void>;
  signInWithApple: () => Promise<TUser>;
  signInWithGoogle: () => Promise<TUser>;
};

export const useOAuthStore = create<TAuthStore>((set, get) => ({
  signInWithApple: async () => {
    const appleUser = await get().getAppleCredential();

    if (!appleUser.identityToken) {
      throw new Error('Apple identity token is missing');
    }

    const { user } = await oauthAppleRegister({
      authorizationCode: appleUser.authorizationCode ?? '',
      identityToken: appleUser.identityToken,
    });

    return user;
  },

  signInWithGoogle: async () => {
    const gUser = await get().getGoogleUser();

    const { user } = await oauthGoogleRegister({
      email: gUser.email,
      username: gUser.name ?? '',
    });

    return user;
  },

  getAppleCredential: async () => {
    const isAvailable = await AppleAuthentication.isAvailableAsync();

    if (!isAvailable) {
      throw new Error('Apple sign in is not available on this device');
    }

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
    });

    return credential;
  },

  getGoogleUser: async () => {
    GoogleSignin.configure();
    await GoogleSignin.hasPlayServices();

    const { user } = await GoogleSignin.signIn();

    return user;
  },

  googleLogout: async () => {
    try {
      GoogleSignin.configure();

      const googleUser = await GoogleSignin.getCurrentUser();

      if (googleUser) {
        // await GoogleSignin.revokeAccess();
        await GoogleSignin.signOut();
      }
    } catch (e) {}
  },

  appleLogout: async () => {},

  clear: async () => {
    await useOAuthStore.getState().appleLogout();
    await useOAuthStore.getState().googleLogout();
  },
}));

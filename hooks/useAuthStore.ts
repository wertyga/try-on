import {create} from "zustand";

import { oauthGoogleRegister, signInRequest, signUpRequest } from '@/api/auth.api';
import {useUserStore} from "@/hooks/useUserStore";
import Toast from "react-native-toast-message";

import { GoogleSignin } from '@react-native-google-signin/google-signin';

type TAuthStore = {
	isLoading: boolean;
	registerWithGoogle: (...data: Parameters<typeof oauthGoogleRegister>) => Promise<void>;
	signIn: (...data: Parameters<typeof signInRequest>) => Promise<boolean>;
	signUp: (...data: Parameters<typeof signUpRequest>) => Promise<boolean>;
	googleLogout: () => Promise<void>;
	logout: () => void;
}

export const useAuthStore = create<TAuthStore>((set, get) => ({
	isLoading: false,
	
	registerWithGoogle: async (...data: Parameters<typeof oauthGoogleRegister>) => {
		set({isLoading: true});
		
		const { user } = await oauthGoogleRegister(...data);
		
		useUserStore.getState().setUser(user);
		
		set({isLoading: false});
	},
	
	signIn: async (...data: Parameters<typeof signInRequest>) => {
		set({isLoading: true});
		
		const { user } = await signInRequest(...data);
		
		useUserStore.getState().setUser(user);
		
		set({isLoading: false});
		
		return true;
	},
	
	signUp: async (...data: Parameters<typeof signUpRequest>) => {
		set({isLoading: true});
		
		const isSuccess = await signUpRequest(...data);
		
		if (isSuccess) {
			Toast.show({
				type: 'success',
				text1: 'Check your e-mail for confirmation',
			});
		}
		
		set({isLoading: false});
		
		return isSuccess;
	},
	
	logout: () => {
		useUserStore.getState().dropUser();
		get().googleLogout()
	},
	
	googleLogout: async () => {
		const googleUser = GoogleSignin.getCurrentUser();
		
		if (googleUser) {
			await GoogleSignin.revokeAccess();
			await GoogleSignin.signOut();
		}
	},
}));

import {
  SignInRequest,
  UserResponse,
  SignUpRequest,
  RecoveryPasswordRequest,
  RecoveryPasswordInitRequest,
  ChangeEmailRequest,
} from './auth.types';
import { baseQuery } from '@/api/base';

export const signInRequest = async (
  data: SignInRequest,
): Promise<UserResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/signin',
    data,
  });

  return response;
};

export const signUpRequest = async (data: SignUpRequest): Promise<boolean> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/signup',
    data,
  });

  return !!response?.success;
};

export const recoveryPassword = async (
  data: RecoveryPasswordRequest,
): Promise<{ success: boolean }> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-password',
    data,
  });

  return response;
};

export const recoveryPasswordInit = async (
  data: RecoveryPasswordInitRequest,
): Promise<{ success: boolean }> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-password-init',
    data,
  });

  return response;
};

export const changeEmail = async (
  data: ChangeEmailRequest,
): Promise<{ success: boolean }> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-email',
    data,
  });

  return response;
};

import { baseQuery } from './base-query';

import {
  ChangeEmailRequest,
  RecoveryPasswordInitRequest,
  RecoveryPasswordRequest,
  SignInRequest,
  SignUpRequest,
  SuccessResponse,
  UserResponse,
} from '@/types';

export const signInRequest = async (
  data: SignInRequest
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
  data: RecoveryPasswordRequest
): Promise<SuccessResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-password',
    data,
  });

  return response;
};

export const recoveryPasswordInit = async (
  data: RecoveryPasswordInitRequest
): Promise<SuccessResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-password-init',
    data,
  });

  return response;
};

export const changeEmail = async (
  data: ChangeEmailRequest
): Promise<SuccessResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/change-email',
    data,
  });

  return response;
};

export const oauthGoogleRegister = async (data: {
  email: string;
  username: string;
}): Promise<UserResponse> => {
  const { data: response } = await baseQuery({
    method: 'post',
    url: '/auth/oauth/google',
    data,
  });

  return response;
};

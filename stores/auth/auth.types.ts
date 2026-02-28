import { TUser } from '@/types/user';

export type AuthCommonRequest = {
  email: string;
  password: string;
  username: string;
};

export type ChangeEmailRequest = {
  newEmail: string;
  password: string;
};

export type SignInRequest = {
  email: string;
  password: string;
};

export type OauthGoogleRequest = {
  accessToken: string;
  tokenType: string;
};

export type OauthFacebookRequest = {
  accessToken: string;
};

export type UserResponse = {
  user: TUser;
};

export type SignUpRequest = {
  username: string;
  password: string;
  email: string;
};

export type RecoveryPasswordInitRequest = {
  email: string;
};

export type RecoveryPasswordRequest = {
  email: string;
  token: string;
  password: string;
};

import { Categories } from '@/types/product';

export enum USER_TAGS {
  User = 'User',
  List = 'UsersList',
}

export enum USER_TYPES {
  TEMPORARY = 'TEMPORARY',
  RECOVERING = 'RECOVERING',
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum USER_RANKS {
  Wanderer = 'Wanderer', // Initial rank
  Adventurer = 'Adventurer',
}

export type Language = {
  language: string;
  flag: string;
};

export type TUser = {
  createdAt: string;
  updatedAt: string;
  _id: string;
  username: string;
  email: string;
  token: string;
  avatar: string;
  categories: Categories[];
  status: USER_TYPES;
  languages: Language[];
};

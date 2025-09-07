import { City } from '@/types/city';
import { Guide, Path } from '@/types/guide';
import { Place } from '@/types/place';

import { Like } from './likes';

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

export type User = {
  createdAt: string;
  updatedAt: string;
  _id: string;
  username: string;
  email: string;
  token: string;
  country: string;
  city: string;
  likes: Like;
  subscribers: Like;
  subscriptions: Like;
  avatar: string;
  status: USER_TYPES;
  rank: USER_RANKS;
  slug: string;
  story: string;
  languages: Language[];
  isVisible: boolean;
  lastCity?: City;
};

export type UserFavoritesResponse = {
  guides: Guide[];
  places: Place[];
};

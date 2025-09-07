export type Like = {
  count: number;
  isInteracted: boolean;
};

export enum SOCIAL_TYPES {
  Like = 'Like',
  Subscribe = 'Subscribe',
}

export enum SOCIAL_MODELS {
  Guide = 'Guide',
  Place = 'Place',
}

export type SetLikeRequest = {
  modelType: SOCIAL_MODELS;
  _id: string;
};
export type SetLikeResponse = {
  count: number;
  isInteracted: boolean;
};

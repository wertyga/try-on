import { City } from '@/types/city';
import { Guide } from '@/types/guide';
import { Place } from '@/types/place';

export type GetGlobalSearchRequest = {
  search: string;
};
export type GetGlobalSearchResponse = {
  cities: City[];
  guides: Guide[];
  places: Place[];
};

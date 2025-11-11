export enum Categories {
  'tshirt' = 'tshirt',
  'blouse_shirt' = 'blouse_shirt',
  'sweater' = 'sweater',
  'hoodie_sweatshirt' = 'hoodie_sweatshirt',
  'jacket_blazer' = 'jacket_blazer',
  'coat_outerwear' = 'coat_outerwear',
  'trousers' = 'trousers',
  'skirt' = 'skirt',
  'shorts' = 'shorts',
  'dress_casual' = 'dress_casual',
  'dress_evening' = 'dress_evening',
  'dress_party' = 'dress_party',
  'set_coord' = 'set_coord',
}

export type TProduct = {
  categories: {
    slug: string;
    title: string;
  }[];
  _id: string;
  title: string;
  description: string;
  imageUrl: string;
  deepLink: string;
  awId: string;
  zone: string;
};

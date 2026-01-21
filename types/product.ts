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

export type Categories = string;

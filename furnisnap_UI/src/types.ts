export interface FurnitureItem {
  id: string;
  name: string;
  price: number;
  brand: string;
  image: string;
  matchPercentage: number;
  category: string;
  style: string;
}

export type View = 'landing' | 'results' | 'dashboard';

export interface User {
  name: string;
  avatar?: string;
}

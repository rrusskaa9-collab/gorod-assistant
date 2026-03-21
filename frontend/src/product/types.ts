export type NoiseLevel = 'low' | 'medium' | 'high';
export type CozyLevel = 'low' | 'high';
export type PriceLevel = 'low' | 'medium' | 'high';

export type PlaceReview = {
  author: string;
  rating: number;
  text: string;
};

export type Place = {
  id: string;
  name: string;
  photos: string[];
  lat: number;
  lng: number;
  location: string;
  metro: string;
  hours: string;
  avgCheck: string;
  description: string;
  vibe: string;
  menu: string[];
  noise: NoiseLevel;
  cozy: CozyLevel;
  price: PriceLevel;
  reviews: PlaceReview[];
};

export type UserSignals = {
  likedIds: string[];
  dislikedIds: string[];
  checkedInIds: string[];
};

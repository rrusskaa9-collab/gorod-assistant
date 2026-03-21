export type NoiseLevel = 'low' | 'medium' | 'high';
export type CozyLevel = 'low' | 'high';
export type PriceLevel = 'low' | 'medium' | 'high';

export type Place = {
  id: string;
  name: string;
  photo: string;
  lat: number;
  lng: number;
  vibe: string;
  topItems: string[];
  noise: NoiseLevel;
  cozy: CozyLevel;
  price: PriceLevel;
};

export type UserSignals = {
  likedIds: string[];
  dislikedIds: string[];
  checkedInIds: string[];
};

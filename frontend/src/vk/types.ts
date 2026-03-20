export type EntityType = 'place' | 'dish' | 'drink';

export type PlaceCategory = 'Ресторан' | 'Бар' | 'Кафе';

export type Place = {
  id: number;
  entity_type: 'place';
  name: string;
  category: PlaceCategory;
  rating?: number; // усредненный рейтинг (для итерации 1 — моковое поле)
  imageUrl: string;
};

export type Dish = {
  id: number;
  entity_type: 'dish';
  place_id: number;
  name: string;
  imageUrl: string;
};

export type Drink = {
  id: number;
  entity_type: 'drink';
  place_id: number;
  name: string;
  imageUrl: string;
};

export type ReviewEntity = Place | Dish | Drink;

export type SearchEntity = {
  entity_type: EntityType;
  entity_id: number;
  place_id?: number;
  backend_id?: string;
  title: string;
  subtitle: string; // "тип" для карточки
  rating?: number;
  imageUrl: string;
};

// DTO с backend для итерации 4 (/api/cards)
export type CardsApiResponseItem = {
  id: string;
  title: string;
  image: string;
  rating: number;
  category: 'Ресторан' | 'Бар' | 'Кафе';
};

export type ReviewItem = {
  id: string;
  user_id: string;
  rating: number;
  text: string | null;
  created_at: string;
};

export type ReviewsPage = {
  items: ReviewItem[];
  next_cursor: string | null;
};

export type MapPoint = {
  id: string;
  title?: string;
  lat: number;
  lng: number;
  rating?: number;
  category?: string;
  kind: 'point' | 'cluster';
  count?: number;
};


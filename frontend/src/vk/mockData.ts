import type { Drink, Dish, Place, SearchEntity } from './types';

export const PLACES: Place[] = [
  {
    id: 1,
    entity_type: 'place',
    name: 'Лес & Кофе',
    category: 'Кафе',
    rating: 4.7,
    imageUrl: 'https://placehold.co/600x420.png?text=%D0%9A%D0%B0%D1%84%D0%B5+%D0%9B%D0%B5%D1%81+%26+%D0%9A%D0%BE%D1%84%D0%B5',
  },
  {
    id: 2,
    entity_type: 'place',
    name: 'Neon Burger',
    category: 'Ресторан',
    rating: 4.6,
    imageUrl: 'https://placehold.co/600x420.png?text=Neon+Burger',
  },
  {
    id: 3,
    entity_type: 'place',
    name: 'Бар у Рейна',
    category: 'Бар',
    rating: 4.5,
    imageUrl: 'https://placehold.co/600x420.png?text=%D0%91%D0%B0%D1%80+%D1%83+%D0%A0%D0%B5%D0%B9%D0%BD%D0%B0',
  },
  {
    id: 4,
    entity_type: 'place',
    name: 'Солёная Волна',
    category: 'Ресторан',
    rating: 4.8,
    imageUrl: 'https://placehold.co/600x420.png?text=%D0%A1%D0%BE%D0%BB%D1%91%D0%BD%D0%B0%D1%8F+%D0%92%D0%BE%D0%BB%D0%BD%D0%B0',
  },
  {
    id: 5,
    entity_type: 'place',
    name: 'Кофейная Линия',
    category: 'Кафе',
    rating: 4.4,
    imageUrl: 'https://placehold.co/600x420.png?text=%D0%9A%D0%BE%D1%84%D0%B5%D0%B9%D0%BD%D0%B0%D1%8F+%D0%9B%D0%B8%D0%BD%D0%B8%D1%8F',
  },
];

export const DISHES: Dish[] = [
  { id: 101, entity_type: 'dish', place_id: 2, name: 'Трюфельный бургер', imageUrl: 'https://placehold.co/600x420.png?text=%D0%A2%D1%80%D1%8E%D1%84%D0%B5%D0%BB%D1%8C%D0%BD%D1%8B%D0%B9+%D0%B1%D1%83%D1%80%D0%B3%D0%B5%D1%80' },
  { id: 102, entity_type: 'dish', place_id: 4, name: 'Устрицы с лаймом', imageUrl: 'https://placehold.co/600x420.png?text=%D0%A3%D1%81%D1%82%D1%80%D0%B8%D1%86%D1%8B+%D1%81+%D0%BB%D0%B0%D0%B9%D0%BC%D0%BE%D0%BC' },
  { id: 103, entity_type: 'dish', place_id: 1, name: 'Панна-котта с ягодами', imageUrl: 'https://placehold.co/600x420.png?text=%D0%9F%D0%B0%D0%BD%D0%BD%D0%B0-%D0%BA%D0%BE%D1%82%D1%82%D0%B0+%D1%81+%D1%8F%D0%B3%D0%BE%D0%B4%D0%B0%D0%BC%D0%B8' },
];

export const DRINKS: Drink[] = [
  { id: 201, entity_type: 'drink', place_id: 3, name: 'Коктейль “Северное сияние”', imageUrl: 'https://placehold.co/600x420.png?text=%D0%A1%D0%B5%D0%B2%D0%B5%D1%80%D0%BD%D0%BE%D0%B5+%D1%81%D0%B8%D1%8F%D0%BD%D0%B8%D0%B5' },
  { id: 202, entity_type: 'drink', place_id: 1, name: 'Холодный кофе', imageUrl: 'https://placehold.co/600x420.png?text=%D0%A5%D0%BE%D0%BB%D0%BE%D0%B4%D0%BD%D1%8B%D0%B9+%D0%BA%D0%BE%D1%84%D0%B5' },
  { id: 203, entity_type: 'drink', place_id: 4, name: 'Лимонад “Мята-Цитрус”', imageUrl: 'https://placehold.co/600x420.png?text=%D0%9B%D0%B8%D0%BC%D0%BE%D0%BD%D0%B0%D0%B4+%D0%9C%D1%8F%D1%82%D0%B0-%D0%A6%D0%B8%D1%82%D1%80%D1%83%D1%81' },
];

export const FAVORITES: SearchEntity[] = [
  { entity_type: 'place', entity_id: 4, place_id: 4, title: 'Солёная Волна', subtitle: 'Ресторан', rating: 4.8, imageUrl: PLACES.find((p) => p.id === 4)!.imageUrl },
  { entity_type: 'dish', entity_id: 101, place_id: 2, title: 'Трюфельный бургер', subtitle: 'Блюдо', imageUrl: DISHES.find((d) => d.id === 101)!.imageUrl },
  { entity_type: 'drink', entity_id: 201, place_id: 3, title: 'Северное сияние', subtitle: 'Напиток', imageUrl: DRINKS.find((d) => d.id === 201)!.imageUrl },
  { entity_type: 'place', entity_id: 2, place_id: 2, title: 'Neon Burger', subtitle: 'Ресторан', rating: 4.6, imageUrl: PLACES.find((p) => p.id === 2)!.imageUrl },
  { entity_type: 'dish', entity_id: 102, place_id: 4, title: 'Устрицы с лаймом', subtitle: 'Блюдо', imageUrl: DISHES.find((d) => d.id === 102)!.imageUrl },
  { entity_type: 'place', entity_id: 1, place_id: 1, title: 'Лес & Кофе', subtitle: 'Кафе', rating: 4.7, imageUrl: PLACES.find((p) => p.id === 1)!.imageUrl },
  { entity_type: 'drink', entity_id: 202, place_id: 1, title: 'Холодный кофе', subtitle: 'Напиток', imageUrl: DRINKS.find((d) => d.id === 202)!.imageUrl },
  { entity_type: 'place', entity_id: 3, place_id: 3, title: 'Бар у Рейна', subtitle: 'Бар', rating: 4.5, imageUrl: PLACES.find((p) => p.id === 3)!.imageUrl },
];

export const ALL_FOR_SEARCH: SearchEntity[] = [
  ...FAVORITES,
  // чуть расширяем “поиск по сущностям” моковыми вариантами
  { entity_type: 'dish', entity_id: 103, place_id: 1, title: 'Панна-котта с ягодами', subtitle: 'Блюдо', imageUrl: DISHES.find((d) => d.id === 103)!.imageUrl },
  { entity_type: 'drink', entity_id: 203, place_id: 4, title: 'Лимонад “Мята-Цитрус”', subtitle: 'Напиток', imageUrl: DRINKS.find((d) => d.id === 203)!.imageUrl },
  { entity_type: 'place', entity_id: 5, place_id: 5, title: 'Кофейная Линия', subtitle: 'Кафе', rating: 4.4, imageUrl: PLACES.find((p) => p.id === 5)!.imageUrl },
];


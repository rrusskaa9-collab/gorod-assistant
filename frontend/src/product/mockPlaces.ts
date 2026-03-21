import type { Place } from './types';

const photoSets = [
  [
    'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1528605248644-14dd04022da1?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1516997121675-4c2d1684aa3e?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1541544741938-0af808871cc0?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=1200&q=80',
  ],
  [
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
  ],
];

const baseNames = [
  'Neon Burger',
  'Лес & Кофе',
  'Бар у Рейна',
  'Basilico',
  'Mia Cucina',
  'Vinyl Taproom',
  'Smoky Grill',
  'Green Leaf',
  'Fish Point',
  'Nori House',
];

const metros = ['Тверская', 'Пушкинская', 'Новокузнецкая', 'Арбатская', 'Третьяковская', 'Белорусская'];
const kinds: Place['venueKind'][] = ['restaurant', 'bar', 'cafe'];
const foods: Place['foodType'][] = ['meat', 'vegetarian', 'asian', 'seafood', 'dessert', 'mixed'];

const menuByFood: Record<Place['foodType'], string[]> = {
  meat: ['Стейк', 'Бургер', 'BBQ ребра'],
  vegetarian: ['Боул', 'Хумус', 'Овощи гриль'],
  asian: ['Рамен', 'Том-ям', 'Суши'],
  seafood: ['Поке', 'Креветки', 'Лосось терияки'],
  dessert: ['Тирамису', 'Чизкейк', 'Круассан'],
  mixed: ['Паста', 'Салат', 'Суп дня'],
};

export const PLACES: Place[] = Array.from({ length: 30 }, (_, i) => {
  const idx = i + 1;
  const foodType = foods[i % foods.length];
  const venueKind = kinds[i % kinds.length];
  const avgCheckValue = 900 + (i % 8) * 350;
  const distanceKm = Number((0.6 + (i % 12) * 0.45).toFixed(1));
  const noise: Place['noise'] = i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low';
  const cozy: Place['cozy'] = i % 2 === 0 ? 'high' : 'low';
  const price: Place['price'] = avgCheckValue < 1500 ? 'low' : avgCheckValue < 2600 ? 'medium' : 'high';
  const photos = photoSets[i % photoSets.length];

  return {
    id: `p${idx}`,
    name: `${baseNames[i % baseNames.length]} ${idx}`,
    photos,
    lat: 55.73 + (i % 10) * 0.004,
    lng: 37.58 + (i % 10) * 0.005,
    distanceKm,
    venueKind,
    foodType,
    avgCheckValue,
    location: `ул. Примерная, ${10 + idx}`,
    metro: metros[i % metros.length],
    hours: i % 2 === 0 ? '10:00-23:00' : '12:00-02:00',
    avgCheck: `${avgCheckValue} RUB`,
    description: `Место #${idx}: быстрый выбор для сегодняшнего вечера.`,
    vibe: `${venueKind === 'bar' ? 'атмосферный бар' : venueKind === 'cafe' ? 'спокойное кафе' : 'яркий ресторан'} с вайбом ${foodType}`,
    menu: [...menuByFood[foodType], 'Фирменный напиток', 'Десерт дня'],
    noise,
    cozy,
    price,
    reviews: [
      { author: 'Гость 1', rating: 5, text: 'Очень понравилась атмосфера.', source: 'Яндекс Карты' },
      { author: 'Гость 2', rating: 4, text: 'Хорошее место, вернусь еще.', source: '2ГИС' },
    ],
  };
});

import type { Place, PlaceReview } from './types';

const yandexUrl = (place: Place) =>
  `https://yandex.ru/maps/?text=${encodeURIComponent(place.name + ' ' + place.location)}`;
const dgisUrl = (place: Place) =>
  `https://2gis.ru/search/${encodeURIComponent(place.name + ' ' + place.location)}`;

export const fetchExternalReviews = async (place: Place): Promise<PlaceReview[]> => {
  await new Promise((resolve) => setTimeout(resolve, 120));
  return place.reviews.map((r, idx) => ({
    ...r,
    sourceUrl: r.source === 'Яндекс Карты' ? yandexUrl(place) : dgisUrl(place),
    author: r.author || `Гость ${idx + 1}`,
  }));
};

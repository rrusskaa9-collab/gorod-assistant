import type { Place, UserSignals } from './types';

const scorePlace = (place: Place, signals: UserSignals) => {
  let score = 0;
  if (signals.likedIds.includes(place.id)) score += 6;
  if (signals.checkedInIds.includes(place.id)) score += 4;
  if (signals.dislikedIds.includes(place.id)) score -= 8;

  const likedSet = new Set(signals.likedIds);
  const likedCount = likedSet.size || 1;

  if (likedSet.size > 0) {
    const cozyLikes = signals.likedIds.filter((id) => id.startsWith('p2') || id.startsWith('p3') || id.startsWith('p5')).length;
    if (cozyLikes / likedCount >= 0.5 && place.cozy === 'high') score += 2;
  }

  if (place.price === 'medium') score += 1;
  return score;
};

export const getTopRecommendations = (places: Place[], signals: UserSignals, limit = 3) => {
  return [...places]
    .sort((a, b) => scorePlace(b, signals) - scorePlace(a, signals))
    .slice(0, limit);
};

export const whyRecommended = (place: Place, signals: UserSignals) => {
  if (signals.likedIds.includes(place.id)) return 'Ты уже лайкал это место';
  if (place.cozy === 'high' && signals.likedIds.length > 0) return 'Похоже на места, где ты ставил лайк';
  if (signals.checkedInIds.length > 0) return 'Схожий вайб с местами, где ты был';
  return 'Популярный выбор на сегодня';
};

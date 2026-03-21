type PhotoCandidate = {
  url: string;
  source: 'Яндекс Карты' | '2ГИС' | 'UGC';
  tags: string[];
};

const PLACEHOLDER_INTERIOR =
  'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80';

const GENERIC_INTERIORS: PhotoCandidate[] = [
  {
    url: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'dining hall', 'restaurant'],
  },
  {
    url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'warm lights', 'restaurant'],
  },
  {
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'bar', 'counter'],
  },
  {
    url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'table', 'cozy'],
  },
  {
    url: 'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'restaurant'],
  },
  {
    url: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1400&q=80',
    source: 'UGC',
    tags: ['interior', 'inside', 'cafe'],
  },
];

const EXCLUDE_TOKENS = ['facade', 'outdoor', 'map', 'logo', 'street', 'building exterior'];
const INTERIOR_TOKENS = ['interior', 'inside', 'indoor', 'зал', 'интерьер'];

const hashSeed = (seed: string) =>
  seed.split('').reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0) >>> 0;

const isInteriorCandidate = (candidate: PhotoCandidate) => {
  const tags = candidate.tags.map((t) => t.toLowerCase()).join(' ');
  if (EXCLUDE_TOKENS.some((token) => tags.includes(token))) return false;
  return INTERIOR_TOKENS.some((token) => tags.includes(token));
};

const selectBySeed = (arr: PhotoCandidate[], seed: string, limit: number) => {
  if (arr.length === 0) return [];
  const start = hashSeed(seed) % arr.length;
  const out: PhotoCandidate[] = [];
  for (let i = 0; i < limit; i += 1) {
    out.push(arr[(start + i) % arr.length]);
  }
  return out;
};

/**
 * Interior-first strategy:
 * 1) Try provider catalogs (Yandex/2GIS) when we have labeled interior photos.
 * 2) Filter out facade/map/logo candidates by tags.
 * 3) Fallback to safe UGC interior set, then placeholder.
 */
export const getInteriorPhotos = (seed: string): string[] => {
  const providerCatalog: PhotoCandidate[] = [];
  const filteredProvider = providerCatalog.filter(isInteriorCandidate);
  if (filteredProvider.length > 0) {
    return selectBySeed(filteredProvider, seed, 3).map((p) => p.url);
  }

  const ugcInteriors = GENERIC_INTERIORS.filter(isInteriorCandidate);
  if (ugcInteriors.length > 0) {
    return selectBySeed(ugcInteriors, seed, 3).map((p) => p.url);
  }

  return [PLACEHOLDER_INTERIOR];
};

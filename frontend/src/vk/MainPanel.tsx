import { useEffect, useMemo, useState } from 'react';
import type { CardsApiResponseItem, MapPoint, SearchEntity } from './types';
import { EntityCard } from './components/EntityCard';

const EMERGENCY_CARDS: SearchEntity[] = [
  {
    entity_type: 'place',
    entity_id: 1,
    place_id: 1,
    backend_id: 'fallback:1',
    title: 'Лес & Кофе',
    subtitle: 'Кафе',
    rating: 4.7,
    imageUrl: 'https://picsum.photos/seed/fallback1/512/320.webp',
  },
  {
    entity_type: 'place',
    entity_id: 2,
    place_id: 2,
    backend_id: 'fallback:2',
    title: 'Neon Burger',
    subtitle: 'Ресторан',
    rating: 4.6,
    imageUrl: 'https://picsum.photos/seed/fallback2/512/320.webp',
  },
  {
    entity_type: 'place',
    entity_id: 3,
    place_id: 3,
    backend_id: 'fallback:3',
    title: 'Бар у Рейна',
    subtitle: 'Бар',
    rating: 4.5,
    imageUrl: 'https://picsum.photos/seed/fallback3/512/320.webp',
  },
];

type Props = {
  onOpenEntity: (entity: SearchEntity) => void;
};

export const MainPanel = ({ onOpenEntity }: Props) => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'restaurant' | 'dish' | 'drink'>('restaurant');
  const [searchResults, setSearchResults] = useState<SearchEntity[]>([]);
  const [mapExpanded, setMapExpanded] = useState(false);

  const [cards, setCards] = useState<SearchEntity[] | null>(EMERGENCY_CARDS);
  const [loading, setLoading] = useState(true);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);
  const [dataSource, setDataSource] = useState<'v1' | 'legacy-api' | 'fallback'>('fallback');

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const timeout = window.setTimeout(() => controller.abort(), 3500);
        // 1) основной путь: FastAPI v1
        let data: CardsApiResponseItem[] | null = null;
        const v1 = await fetch('/v1/restaurants/popular?limit=20', { signal: controller.signal });
        if (v1.ok) {
          data = (await v1.json()) as CardsApiResponseItem[];
          setDataSource('v1');
        } else {
          // 2) fallback: старый /api/cards (итерация 4 express)
          const legacy = await fetch('/api/cards?limit=20', { signal: controller.signal });
          if (legacy.ok) {
            const legacyData = (await legacy.json()) as Array<{
              id: string;
              title: string;
              image: string;
              rating: number;
            }>;
            data = legacyData.map((x) => ({
              id: x.id,
              title: x.title,
              image: x.image,
              rating: x.rating,
              category: 'Ресторан',
            }));
            setDataSource('legacy-api');
          }
        }

        if (!data || data.length === 0) {
          setCards(EMERGENCY_CARDS);
          setDataSource('fallback');
          window.clearTimeout(timeout);
          return;
        }

        const mapped: SearchEntity[] = data.map((item, index) => ({
          entity_type: 'place',
          entity_id: index + 1,
          place_id: index + 1,
          backend_id: item.id,
          title: item.title,
          subtitle: item.category,
          rating: item.rating,
          imageUrl: item.image,
        }));

        setCards(mapped.length > 0 ? mapped : EMERGENCY_CARDS);
        if (mapped.length === 0) setDataSource('fallback');
        window.clearTimeout(timeout);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[cards api] failed to load:', e);
        setCards(EMERGENCY_CARDS);
        setDataSource('fallback');
      } finally {
        setLoading(false);
      }
    }

    load();
    return () => controller.abort();
  }, []);

  const items: SearchEntity[] = useMemo(() => {
    if (!cards) return [];
    const q = searchQuery.trim().toLowerCase();
    if (!q) return cards.slice(0, 10);

    return cards
      .filter((e) => {
        const inTitle = e.title.toLowerCase().includes(q);
        const inType = e.subtitle.toLowerCase().includes(q);
        return inTitle || inType;
      })
      .slice(0, 12);
  }, [cards, searchQuery]);

  useEffect(() => {
    const id = window.setTimeout(() => setSearchQuery(query), 300);
    return () => window.clearTimeout(id);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadSearch() {
      const q = searchQuery.trim();
      if (!q) {
        setSearchResults([]);
        return;
      }
      try {
        const res = await fetch(`/v1/search?q=${encodeURIComponent(q)}&type=${searchType}&limit=12`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(`search status ${res.status}`);
        }
        const data = (await res.json()) as Array<{
          id: string;
          title: string;
          type: 'restaurant' | 'dish' | 'drink';
          rating?: number;
        }>;
        const mapped: SearchEntity[] = data.map((item, index) => ({
          entity_type: item.type === 'restaurant' ? 'place' : item.type,
          entity_id: 2000 + index,
          place_id: undefined,
          backend_id: item.id,
          title: item.title,
          subtitle: item.type === 'restaurant' ? 'Ресторан' : item.type === 'dish' ? 'Блюдо' : 'Напиток',
          rating: item.rating,
          imageUrl: `https://picsum.photos/seed/search-${item.id}/512/320.webp`,
        }));
        setSearchResults(mapped);
      } catch {
        const qLower = q.toLowerCase();
        const local = (cards ?? EMERGENCY_CARDS)
          .filter(
            (e) =>
              e.title.toLowerCase().includes(qLower) ||
              e.subtitle.toLowerCase().includes(qLower),
          )
          .slice(0, 12);
        setSearchResults(local);
      }
    }
    void loadSearch();
    return () => controller.abort();
  }, [searchQuery, searchType, cards]);

  useEffect(() => {
    const controller = new AbortController();
    async function loadMap() {
      try {
        const timeout = window.setTimeout(() => controller.abort(), 3500);
        const res = await fetch(
          '/v1/restaurants/map?min_lat=55.62&min_lng=37.45&max_lat=55.90&max_lng=37.82&zoom=12&limit=1000',
          { signal: controller.signal },
        );
        if (!res.ok) {
          setMapPoints(
            (cards ?? EMERGENCY_CARDS).map((c, i) => ({
              id: c.backend_id ?? `fallback-map:${i}`,
              kind: 'point',
              lat: 55.75 + i * 0.001,
              lng: 37.61 + i * 0.001,
            })),
          );
          window.clearTimeout(timeout);
          return;
        }
        const data = (await res.json()) as MapPoint[];
        setMapPoints(data);
        window.clearTimeout(timeout);
      } catch {
        setMapPoints(
          (cards ?? EMERGENCY_CARDS).map((c, i) => ({
            id: c.backend_id ?? `fallback-map:${i}`,
            kind: 'point',
            lat: 55.75 + i * 0.001,
            lng: 37.61 + i * 0.001,
          })),
        );
      }
    }
    loadMap();
    return () => controller.abort();
  }, [cards]);

  const bestMonthItems: SearchEntity[] = useMemo(() => {
    if (!cards) return [];
    return [...cards].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)).slice(0, 10);
  }, [cards]);

  const byCategory = useMemo(() => {
    if (!cards) return { restaurants: [], bars: [], cafes: [] };

    const make = (category: SearchEntity['subtitle']): SearchEntity[] => {
      return cards
        .filter((p) => p.subtitle === category)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    };

    return {
      restaurants: make('Ресторан'),
      bars: make('Бар'),
      cafes: make('Кафе'),
    };
  }, [cards]);

  const displayItems = items.length > 0 ? items : EMERGENCY_CARDS;

  return (
    <div className="mainPanel">
      <div className="debugBadge">source: {dataSource}</div>
      <div className="mainPanel__search">
        <input
          className="mainPanel__searchInput"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по заведениям, блюдам и напиткам"
        />
        <div className="searchTypeSwitch" role="tablist" aria-label="Тип поиска">
          <button
            className={`searchTypeSwitch__btn ${searchType === 'restaurant' ? 'is-active' : ''}`}
            onClick={() => setSearchType('restaurant')}
          >
            Рестораны
          </button>
          <button
            className={`searchTypeSwitch__btn ${searchType === 'dish' ? 'is-active' : ''}`}
            onClick={() => setSearchType('dish')}
          >
            Блюда
          </button>
          <button
            className={`searchTypeSwitch__btn ${searchType === 'drink' ? 'is-active' : ''}`}
            onClick={() => setSearchType('drink')}
          >
            Напитки
          </button>
        </div>
      </div>

      {searchQuery.trim() ? (
        <section className="section">
          <h2 className="section__title">Поиск: {searchQuery}</h2>
          {searchResults.length === 0 ? <div className="loading">Ничего не найдено</div> : null}
          <div className="placeList" role="list" aria-label="Результаты поиска">
            {searchResults.map((entity) => (
              <div key={`${entity.entity_type}-${entity.entity_id}`} role="listitem" className="placeList__item">
                <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {searchType === 'restaurant' && searchQuery.trim() ? (
        <section className="section">
          <button className="mapToggleBtn" onClick={() => setMapExpanded((prev) => !prev)}>
            {mapExpanded ? 'Скрыть карту с точками' : 'Показать карту с точками'}
          </button>
          {mapExpanded ? (
            <div className="mapPreview">
              <div className="mapPreview__title">Точки на карте по текущему viewport</div>
              <div className="mapStats">
                <div className="mapStats__item">
                  Точки: {mapPoints.filter((p) => p.kind === 'point').length}
                </div>
                <div className="mapStats__item">
                  Кластеры: {mapPoints.filter((p) => p.kind === 'cluster').length}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="section">
        <h2 className="section__title">Вам понравится</h2>
        {loading ? <div className="loading">Обновляем данные...</div> : null}
        <div className="carousel" role="list" aria-label="Рекомендации">
          {displayItems.map((entity) => (
            <div
              key={`${entity.entity_type}-${entity.entity_id}`}
              role="listitem"
              className="carousel__item"
            >
              <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Лучшее за месяц</h2>
        <div className="carousel" role="list" aria-label="Лучшее за месяц">
          {bestMonthItems.map((entity) => (
            <div
              key={`${entity.entity_type}-${entity.entity_id}`}
              role="listitem"
              className="carousel__item"
            >
              <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Рестораны</h2>
        <div className="placeList" role="list" aria-label="Рестораны по рейтингу">
          {byCategory.restaurants.map((entity) => (
            <div
              key={`${entity.entity_type}-${entity.entity_id}`}
              role="listitem"
              className="placeList__item"
            >
              <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Бары</h2>
        <div className="placeList" role="list" aria-label="Бары по рейтингу">
          {byCategory.bars.map((entity) => (
            <div
              key={`${entity.entity_type}-${entity.entity_id}`}
              role="listitem"
              className="placeList__item"
            >
              <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Кафе</h2>
        <div className="placeList" role="list" aria-label="Кафе по рейтингу">
          {byCategory.cafes.map((entity) => (
            <div
              key={`${entity.entity_type}-${entity.entity_id}`}
              role="listitem"
              className="placeList__item"
            >
              <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <h2 className="section__title">Карта (viewport)</h2>
        <div className="mapStats">
          <div className="mapStats__item">
            Точки: {mapPoints.filter((p) => p.kind === 'point').length}
          </div>
          <div className="mapStats__item">
            Кластеры: {mapPoints.filter((p) => p.kind === 'cluster').length}
          </div>
        </div>
      </section>
    </div>
  );
};


import { useEffect, useMemo, useState } from 'react';
import type { CardsApiResponseItem, MapPoint, SearchEntity } from './types';
import { EntityCard } from './components/EntityCard';

type Props = {
  onOpenEntity: (entity: SearchEntity) => void;
};

export const MainPanel = ({ onOpenEntity }: Props) => {
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const [cards, setCards] = useState<SearchEntity[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [mapPoints, setMapPoints] = useState<MapPoint[]>([]);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/v1/restaurants/popular?limit=20', { signal: controller.signal });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = (await res.json()) as CardsApiResponseItem[];

        const mapped: SearchEntity[] = data.map((item, index) => {
          const numericId = index + 1;

          return {
            entity_type: 'place',
            entity_id: numericId,
            place_id: numericId,
            backend_id: item.id,
            title: item.title,
            subtitle: item.category,
            rating: item.rating,
            imageUrl: item.image,
          };
        });

        setCards(mapped);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn('[cards api] failed to load:', e);
        setCards([]);
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
    async function loadMap() {
      try {
        const res = await fetch(
          '/v1/restaurants/map?min_lat=55.62&min_lng=37.45&max_lat=55.90&max_lng=37.82&zoom=12&limit=1000',
          { signal: controller.signal },
        );
        if (!res.ok) return;
        const data = (await res.json()) as MapPoint[];
        setMapPoints(data);
      } catch {
        setMapPoints([]);
      }
    }
    loadMap();
    return () => controller.abort();
  }, []);

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

  return (
    <div className="mainPanel">
      <div className="mainPanel__search">
        <input
          className="mainPanel__searchInput"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по заведениям, блюдам и напиткам"
          disabled={loading}
        />
      </div>

      <section className="section">
        <h2 className="section__title">Вам понравится</h2>
        {loading ? <div className="loading">Загрузка...</div> : null}
        {!loading ? (
          <div className="carousel" role="list" aria-label="Рекомендации">
            {items.map((entity) => (
              <div
                key={`${entity.entity_type}-${entity.entity_id}`}
                role="listitem"
                className="carousel__item"
              >
                <EntityCard entity={entity} onClick={() => onOpenEntity(entity)} />
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">Лучшее за месяц</h2>
        {!loading ? (
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
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">Рестораны</h2>
        {!loading ? (
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
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">Бары</h2>
        {!loading ? (
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
        ) : null}
      </section>

      <section className="section">
        <h2 className="section__title">Кафе</h2>
        {!loading ? (
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
        ) : null}
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


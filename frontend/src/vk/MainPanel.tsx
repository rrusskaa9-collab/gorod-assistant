import { useMemo, useState } from 'react';
import type { SearchEntity } from './types';
import { ALL_FOR_SEARCH, FAVORITES, PLACES } from './mockData';
import { EntityCard } from './components/EntityCard';

export const MainPanel = () => {
  const [query, setQuery] = useState('');

  const items: SearchEntity[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAVORITES;

    return ALL_FOR_SEARCH.filter((e) => {
      const inTitle = e.title.toLowerCase().includes(q);
      const inType = e.subtitle.toLowerCase().includes(q);
      return inTitle || inType;
    }).slice(0, 12);
  }, [query]);

  const bestMonthItems: SearchEntity[] = useMemo(() => {
    const sorted = [...PLACES].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    return sorted.slice(0, 10).map((p) => ({
      entity_type: 'place',
      entity_id: p.id,
      place_id: p.id,
      title: p.name,
      subtitle: p.category,
      rating: p.rating,
      imageUrl: p.imageUrl,
    }));
  }, []);

  const byCategory = useMemo(() => {
    const make = (category: SearchEntity['subtitle']): SearchEntity[] => {
      const sorted = [...PLACES]
        .filter((p) => p.category === category)
        .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));

      return sorted.map((p) => ({
        entity_type: 'place',
        entity_id: p.id,
        place_id: p.id,
        title: p.name,
        subtitle: p.category,
        rating: p.rating,
        imageUrl: p.imageUrl,
      }));
    };

    return {
      restaurants: make('Ресторан'),
      bars: make('Бар'),
      cafes: make('Кафе'),
    };
  }, []);

  return (
    <div className="mainPanel">
      <div className="mainPanel__search">
        <input
          className="mainPanel__searchInput"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Поиск по заведениям, блюдам и напиткам"
        />
      </div>

      <section className="section">
        <h2 className="section__title">Вам понравится</h2>
        <div className="carousel" role="list" aria-label="Рекомендации">
          {items.map((entity) => (
            <div key={`${entity.entity_type}-${entity.entity_id}`} role="listitem" className="carousel__item">
              <EntityCard entity={entity} />
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
              <EntityCard entity={entity} />
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
              <EntityCard entity={entity} />
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
              <EntityCard entity={entity} />
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
              <EntityCard entity={entity} />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};


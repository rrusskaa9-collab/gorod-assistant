import { useState } from 'react';
import { PlaceDetailsSheet } from '../components/PlaceDetailsSheet';
import type { Place } from '../types';

type Props = {
  places: Place[];
  savedIds: string[];
};

export const SavedScreen = ({ places, savedIds }: Props) => {
  const saved = places.filter((p) => savedIds.includes(p.id));
  const [selected, setSelected] = useState<Place | null>(null);

  return (
    <section className="screen">
      <h2 className="screen__title">Сохраненные</h2>
      {saved.length === 0 ? <p className="emptyText">Пока пусто — лайкни пару мест.</p> : null}
      <div className="savedGrid">
        {saved.map((place) => (
          <article
            key={place.id}
            className="savedTile"
            onClick={() => setSelected(place)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setSelected(place);
              }
            }}
          >
            <img src={place.photos[0]} alt={place.name} />
            <div className="savedTile__name">{place.name}</div>
          </article>
        ))}
      </div>
      {selected ? <PlaceDetailsSheet place={selected} onClose={() => setSelected(null)} /> : null}
    </section>
  );
};

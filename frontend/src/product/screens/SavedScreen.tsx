import type { Place } from '../types';

type Props = {
  places: Place[];
  savedIds: string[];
};

export const SavedScreen = ({ places, savedIds }: Props) => {
  const saved = places.filter((p) => savedIds.includes(p.id));

  return (
    <section className="screen">
      <h2 className="screen__title">Сохраненные</h2>
      {saved.length === 0 ? <p className="emptyText">Пока пусто — лайкни пару мест.</p> : null}
      <div className="savedGrid">
        {saved.map((place) => (
          <article key={place.id} className="savedTile">
            <img src={place.photos[0]} alt={place.name} />
            <div className="savedTile__name">{place.name}</div>
          </article>
        ))}
      </div>
    </section>
  );
};

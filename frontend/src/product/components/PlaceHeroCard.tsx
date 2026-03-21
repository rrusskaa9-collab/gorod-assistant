import { useState } from 'react';
import { whyRecommended } from '../recommendation';
import type { Place, UserSignals } from '../types';

type Props = {
  place: Place;
  signals: UserSignals;
  onGo: (place: Place) => void;
  onLike?: (place: Place) => void;
};

export const PlaceHeroCard = ({ place, signals, onGo, onLike }: Props) => {
  const [showWhy, setShowWhy] = useState(false);

  return (
    <article className="placeHero">
      <img className="placeHero__photo" src={place.photo} alt={place.name} loading="lazy" />
      <div className="placeHero__overlay">
        <div className="placeHero__badge">тебе подойдет</div>
        <h3 className="placeHero__title">{place.name}</h3>
        <p className="placeHero__vibe">{place.vibe}</p>
        <div className="placeHero__actions">
          <button type="button" className="actionBtn actionBtn--primary" onClick={() => onGo(place)}>
            Пойти
          </button>
          <button type="button" className="actionBtn" onClick={() => setShowWhy((v) => !v)}>
            Почему это мне
          </button>
          {onLike ? (
            <button type="button" className="actionBtn" onClick={() => onLike(place)}>
              Лайк
            </button>
          ) : null}
        </div>
        {showWhy ? <div className="placeHero__why">{whyRecommended(place, signals)}</div> : null}
      </div>
    </article>
  );
};

import { useEffect, useState } from 'react';
import { fetchExternalReviews } from '../externalReviews';
import type { Place } from '../types';

type Props = {
  place: Place;
  onClose: () => void;
  onLike?: (place: Place) => void;
  onDislike?: (place: Place) => void;
};

const buildRouteUrl = (place: Place) =>
  `https://yandex.ru/maps/?rtext=geo~${place.lat}%2C${place.lng}&rtt=auto`;

export const PlaceDetailsSheet = ({ place, onClose, onLike, onDislike }: Props) => {
  const [reviews, setReviews] = useState(place.reviews);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const routeUrl = buildRouteUrl(place);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingReviews(true);
      try {
        const external = await fetchExternalReviews(place);
        if (mounted) setReviews(external);
      } finally {
        if (mounted) setLoadingReviews(false);
      }
    };
    void load();
    return () => {
      mounted = false;
    };
  }, [place]);

  return (
    <div className="placeModalBackdrop" onClick={onClose}>
      <div className="placeModal" onClick={(e) => e.stopPropagation()}>
        <h3 className="placeModal__title">{place.name}</h3>
        <div className="placeModal__meta">
          <div>Местоположение: {place.location}</div>
          <div>Метро: {place.metro}</div>
          <div>Время работы: {place.hours}</div>
          <div>Средний чек: {place.avgCheck}</div>
        </div>
        <p className="placeModal__desc">{place.description}</p>

        <div className="placeModal__blockTitle">Маршрут</div>
        <a className="routeLink" href={routeUrl} target="_blank" rel="noreferrer">
          Построить маршрут в Я.Картах
        </a>

        <div className="placeModal__blockTitle">Меню</div>
        <div className="placeModal__chips">
          {place.menu.map((item) => (
            <span key={`${place.id}-menu-${item}`} className="placeModal__chip">
              {item}
            </span>
          ))}
        </div>

        <div className="placeModal__blockTitle">Отзывы</div>
        <div className="placeModal__sourceHint">Источники: Яндекс Карты и 2ГИС</div>
        <div className="placeModal__reviews">
          {loadingReviews ? <div className="placeModal__loading">Загружаем отзывы из внешних источников...</div> : null}
          {reviews.map((r, idx) => (
            <div className="placeModal__review" key={`${place.id}-review-${idx}`}>
              <div className="placeModal__reviewHead">
                {r.author} · {r.rating}/5
              </div>
              <div className="placeModal__reviewSource">
                Источник: {r.source}
                {r.sourceUrl ? (
                  <>
                    {' · '}
                    <a href={r.sourceUrl} target="_blank" rel="noreferrer">
                      открыть
                    </a>
                  </>
                ) : null}
              </div>
              <div>{r.text}</div>
            </div>
          ))}
        </div>

        {onLike || onDislike ? (
          <div className="swipeActions">
            {onDislike ? (
              <button type="button" className="actionBtn" onClick={() => onDislike(place)}>
                Не нравится
              </button>
            ) : null}
            {onLike ? (
              <button type="button" className="actionBtn actionBtn--primary" onClick={() => onLike(place)}>
                Нравится
              </button>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

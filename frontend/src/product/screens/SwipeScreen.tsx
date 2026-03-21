import { useEffect, useMemo, useRef, useState } from 'react';
import { PlaceDetailsSheet } from '../components/PlaceDetailsSheet';
import type { Place } from '../types';

type Props = {
  places: Place[];
  index: number;
  onSwipeLike: (place: Place) => void;
  onSwipeDislike: (place: Place) => void;
};

export const SwipeScreen = ({ places, index, onSwipeLike, onSwipeDislike }: Props) => {
  const startX = useRef<number | null>(null);
  const pointerDown = useRef(false);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [maxRadius, setMaxRadius] = useState(8);
  const [maxAvgCheck, setMaxAvgCheck] = useState(3500);
  const [minBeauty, setMinBeauty] = useState(3);
  const [foodType, setFoodType] = useState<'all' | Place['foodType']>('all');
  const [venueKind, setVenueKind] = useState<'all' | Place['venueKind']>('all');

  const filteredPlaces = useMemo(
    () =>
      places.filter((p) => {
        if (p.distanceKm > maxRadius) return false;
        if (p.avgCheckValue > maxAvgCheck) return false;
        if (p.beautyScore < minBeauty) return false;
        if (foodType !== 'all' && p.foodType !== foodType) return false;
        if (venueKind !== 'all' && p.venueKind !== venueKind) return false;
        return true;
      }),
    [places, maxRadius, maxAvgCheck, minBeauty, foodType, venueKind],
  );

  const current = useMemo(() => {
    if (filteredPlaces.length === 0) return null;
    return filteredPlaces[index % filteredPlaces.length];
  }, [filteredPlaces, index]);
  const next = useMemo(() => {
    if (filteredPlaces.length < 2) return null;
    return filteredPlaces[(index + 1) % filteredPlaces.length];
  }, [filteredPlaces, index]);

  const maxPhotoIndex = Math.max(0, (current?.photos.length ?? 1) - 1);

  useEffect(() => {
    setPhotoIndex(0);
    setDetailsOpen(false);
  }, [current?.id]);

  const prevPhoto = () => setPhotoIndex((prev) => Math.max(0, prev - 1));
  const nextPhoto = () => setPhotoIndex((prev) => Math.min(maxPhotoIndex, prev + 1));

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.changedTouches[0]?.clientX ?? null;
    pointerDown.current = true;
    setDragging(true);
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const x0 = startX.current;
    const x1 = e.changedTouches[0]?.clientX;
    pointerDown.current = true;
    if (x0 == null || x1 == null) return;
    setDragX(x1 - x0);
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    if (!current) return;
    const x0 = startX.current;
    const x1 = e.changedTouches[0]?.clientX;
    setDragging(false);
    if (x0 == null || x1 == null) {
      setDragX(0);
      return;
    }
    const dx = x1 - x0;
    if (dx > 70) {
      onSwipeLike(current);
      setDragX(0);
      return;
    }
    if (dx < -70) {
      onSwipeDislike(current);
      setDragX(0);
      return;
    }
    setDragX(0);
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (e.pointerType === 'touch') return;
    startX.current = e.clientX;
    pointerDown.current = true;
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!pointerDown.current) return;
    const x0 = startX.current;
    if (x0 == null) return;
    setDragX(e.clientX - x0);
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!current) return;
    if (!pointerDown.current) return;
    pointerDown.current = false;
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    const x0 = startX.current;
    if (x0 == null) {
      setDragX(0);
      return;
    }
    const dx = e.clientX - x0;
    if (dx > 70) {
      onSwipeLike(current);
      setDragX(0);
      return;
    }
    if (dx < -70) {
      onSwipeDislike(current);
      setDragX(0);
      return;
    }
    setDragX(0);
  };

  const onCardTapForPhoto = (clientX: number, card: HTMLDivElement) => {
    const rect = card.getBoundingClientRect();
    const localX = clientX - rect.left;
    if (localX < rect.width / 2) prevPhoto();
    else nextPhoto();
  };

  const openDetails = () => setDetailsOpen(true);

  const closeAndAdvanceLike = (_place?: Place) => {
    if (!current) return;
    onSwipeLike(current);
    setPhotoIndex(0);
    setDetailsOpen(false);
  };

  const closeAndAdvanceDislike = (_place?: Place) => {
    if (!current) return;
    onSwipeDislike(current);
    setPhotoIndex(0);
    setDetailsOpen(false);
  };

  const onCardClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!current) return;
    if (Math.abs(dragX) > 8) return;
    onCardTapForPhoto(e.clientX, e.currentTarget);
  };

  const onCardTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    onTouchEnd(e);
    if (!current) return;
    const x0 = startX.current;
    const x1 = e.changedTouches[0]?.clientX;
    if (x0 == null || x1 == null) return;
    const dx = Math.abs(x1 - x0);
    if (dx < 12) onCardTapForPhoto(x1, e.currentTarget);
  };

  return (
    <section className="screen">
      <div className="swipeTopBar">
        <h2 className="screen__title">Лента вайбов</h2>
        <button type="button" className="settingsBtn" onClick={() => setSettingsOpen((v) => !v)}>
          Настройки
        </button>
      </div>
      {settingsOpen ? (
        <div className="settingsPanel">
          <label className="settingsRow">
            Радиус: {maxRadius.toFixed(1)} км
            <input
              type="range"
              min={0.5}
              max={20}
              step={0.5}
              value={maxRadius}
              onChange={(e) => setMaxRadius(Number(e.target.value))}
            />
          </label>
          <label className="settingsRow">
            Средний чек до: {maxAvgCheck} RUB
            <input
              type="range"
              min={500}
              max={5000}
              step={100}
              value={maxAvgCheck}
              onChange={(e) => setMaxAvgCheck(Number(e.target.value))}
            />
          </label>
          <label className="settingsRow">
            Красоты от: {minBeauty}
            <input
              type="range"
              min={1}
              max={5}
              step={1}
              value={minBeauty}
              onChange={(e) => setMinBeauty(Number(e.target.value))}
            />
          </label>
          <label className="settingsRow">
            Тип кухни
            <select value={foodType} onChange={(e) => setFoodType(e.target.value as typeof foodType)}>
              <option value="all">Все</option>
              <option value="meat">Мясной</option>
              <option value="vegetarian">Вегетарианский</option>
              <option value="asian">Азиатский</option>
              <option value="seafood">Морепродукты</option>
              <option value="dessert">Десерты</option>
              <option value="mixed">Смешанный</option>
            </select>
          </label>
          <label className="settingsRow">
            Формат
            <select value={venueKind} onChange={(e) => setVenueKind(e.target.value as typeof venueKind)}>
              <option value="all">Все</option>
              <option value="restaurant">Ресторан</option>
              <option value="bar">Бар</option>
              <option value="cafe">Кафе</option>
            </select>
          </label>
          <div className="settingsHint">Карточек по фильтру: {filteredPlaces.length}</div>
        </div>
      ) : null}
      {!current ? (
        <div className="emptySwipeState">
          По текущим фильтрам нет карточек. Расширь радиус или средний чек.
        </div>
      ) : null}
      {current ? (
        <>
          <div className="swipeDeck">
            {next ? (
              <div className="swipeCard swipeCard--next" aria-hidden>
                <img className="swipeCard__photo" src={next.photos[0]} alt="" />
              </div>
            ) : null}
            <div
              className={`swipeCard swipeCard--active ${dragging ? 'is-dragging' : ''}`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onCardTouchEnd}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onClick={onCardClick}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
              }}
            >
              <div className="swipeCard__gallery">
                <img className="swipeCard__photo" src={current.photos[photoIndex]} alt={current.name} />
                <div className="swipeCard__dots">
                  {current.photos.map((_, i) => (
                    <span
                      key={`${current.id}-dot-${i}`}
                      className={`swipeCard__dot ${i === photoIndex ? 'is-active' : ''}`}
                    />
                  ))}
                </div>
              </div>
              <div
                className="swipeCard__overlay"
                onClick={(event) => {
                  event.stopPropagation();
                  openDetails();
                }}
              >
                <h3 className="swipeCard__title">{current.name}</h3>
                <p className="swipeCard__vibe">{current.vibe}</p>
                <div className="swipeCard__hints">Тап слева/справа: фото · Свайп: лайк/дизлайк</div>
                <button
                  type="button"
                  className="swipeInfoBtn"
                  onClick={(event) => {
                    event.stopPropagation();
                    openDetails();
                  }}
                >
                  Подробнее
                </button>
              </div>
            </div>
          </div>
          <div className="swipeActions">
            <button type="button" className="actionBtn" onClick={() => onSwipeDislike(current)}>
              Не нравится
            </button>
            <button type="button" className="actionBtn actionBtn--primary" onClick={() => onSwipeLike(current)}>
              Нравится
            </button>
          </div>

          {detailsOpen ? (
            <PlaceDetailsSheet
              place={current}
              onClose={() => setDetailsOpen(false)}
              onLike={closeAndAdvanceLike}
              onDislike={closeAndAdvanceDislike}
            />
          ) : null}
        </>
      ) : null}
    </section>
  );
};

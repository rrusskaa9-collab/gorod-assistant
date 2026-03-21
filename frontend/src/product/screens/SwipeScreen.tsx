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
  const pointerState = useRef<{
    pointerId: number | null;
    downAtMs: number;
    startX: number;
    startY: number;
    moved: boolean;
  }>({
    pointerId: null,
    downAtMs: 0,
    startX: 0,
    startY: 0,
    moved: false,
  });
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

  const nextPhoto = () => setPhotoIndex((prev) => Math.min(maxPhotoIndex, prev + 1));

  const DRAG_START_THRESHOLD = 8;
  const SWIPE_THRESHOLD = 70;
  const TAP_MOVE_THRESHOLD = 8;
  const TAP_TIME_THRESHOLD_MS = 260;

  const finishGesture = () => {
    pointerState.current.pointerId = null;
    pointerState.current.moved = false;
    setDragging(false);
    setDragX(0);
  };

  const onCardZoneTap = (clientX: number, card: HTMLDivElement) => {
    if (!current) return;
    const rect = card.getBoundingClientRect();
    const zone = (clientX - rect.left) / rect.width;

    if (zone < 0.3) {
      onSwipeDislike(current);
      return;
    }
    if (zone > 0.7) {
      nextPhoto();
      return;
    }
    openDetails();
  };

  const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
    pointerState.current.pointerId = e.pointerId;
    pointerState.current.startX = e.clientX;
    pointerState.current.startY = e.clientY;
    pointerState.current.downAtMs = performance.now();
    pointerState.current.moved = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (pointerState.current.pointerId !== e.pointerId) return;
    const dx = e.clientX - pointerState.current.startX;
    const dy = e.clientY - pointerState.current.startY;

    if (!pointerState.current.moved && Math.hypot(dx, dy) >= DRAG_START_THRESHOLD) {
      pointerState.current.moved = true;
    }

    // Start drag only on horizontal intent to preserve page vertical scroll.
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= DRAG_START_THRESHOLD) {
      setDragging(true);
      setDragX(dx);
    }
  };

  const onPointerUp: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (!current) return;
    if (pointerState.current.pointerId !== e.pointerId) return;

    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }

    const dx = e.clientX - pointerState.current.startX;
    const dy = e.clientY - pointerState.current.startY;
    const movedDistance = Math.hypot(dx, dy);
    const heldMs = performance.now() - pointerState.current.downAtMs;
    const isTap = movedDistance <= TAP_MOVE_THRESHOLD && heldMs <= TAP_TIME_THRESHOLD_MS;
    const isDragGesture = Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= DRAG_START_THRESHOLD;
    const target = e.target as HTMLElement | null;
    const isInteractiveTarget = Boolean(target?.closest('button, a, input, select, textarea'));

    if (isDragGesture && dx >= SWIPE_THRESHOLD) {
      onSwipeLike(current);
      finishGesture();
      return;
    }
    if (isDragGesture && dx <= -SWIPE_THRESHOLD) {
      onSwipeDislike(current);
      finishGesture();
      return;
    }

    if (isTap && !isInteractiveTarget) {
      onCardZoneTap(e.clientX, e.currentTarget);
      finishGesture();
      return;
    }

    finishGesture();
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

  const onPointerCancel: React.PointerEventHandler<HTMLDivElement> = (e) => {
    if (pointerState.current.pointerId !== e.pointerId) return;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    finishGesture();
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
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerCancel}
              style={{
                transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
                opacity: 1 - Math.min(Math.abs(dragX) / 360, 0.28),
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
              <div className="swipeCard__overlay">
                <h3 className="swipeCard__title">{current.name}</h3>
                <p className="swipeCard__vibe">{current.vibe}</p>
                <div className="swipeCard__hints">Левая зона: дизлайк · Центр: детали · Правая: следующее фото</div>
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

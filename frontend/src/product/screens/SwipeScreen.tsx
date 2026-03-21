import { useMemo, useRef, useState } from 'react';
import type { Place } from '../types';

type Props = {
  places: Place[];
  index: number;
  onSwipeLike: (place: Place) => void;
  onSwipeDislike: (place: Place) => void;
};

export const SwipeScreen = ({ places, index, onSwipeLike, onSwipeDislike }: Props) => {
  const startX = useRef<number | null>(null);
  const photoStartX = useRef<number | null>(null);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const current = useMemo(() => places[index % places.length], [index, places]);
  const next = useMemo(() => places[(index + 1) % places.length], [index, places]);

  if (!current) return null;

  const maxPhotoIndex = Math.max(0, current.photos.length - 1);

  const prevPhoto = () => setPhotoIndex((prev) => Math.max(0, prev - 1));
  const nextPhoto = () => setPhotoIndex((prev) => Math.min(maxPhotoIndex, prev + 1));

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.changedTouches[0]?.clientX ?? null;
    setDragging(true);
  };

  const onTouchMove: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const x0 = startX.current;
    const x1 = e.changedTouches[0]?.clientX;
    if (x0 == null || x1 == null) return;
    setDragX(x1 - x0);
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
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

  const onGalleryTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    photoStartX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onGalleryTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    e.stopPropagation();
    const x0 = photoStartX.current;
    const x1 = e.changedTouches[0]?.clientX;
    if (x0 == null || x1 == null) return;
    const dx = x1 - x0;
    if (dx > 35) prevPhoto();
    if (dx < -35) nextPhoto();
  };

  const openDetails = () => setDetailsOpen(true);

  const closeAndAdvanceLike = () => {
    onSwipeLike(current);
    setPhotoIndex(0);
    setDetailsOpen(false);
  };

  const closeAndAdvanceDislike = () => {
    onSwipeDislike(current);
    setPhotoIndex(0);
    setDetailsOpen(false);
  };

  return (
    <section className="screen">
      <h2 className="screen__title">Лента вайбов</h2>
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
          onTouchEnd={onTouchEnd}
          style={{
            transform: `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`,
          }}
        >
          <div className="swipeCard__gallery" onTouchStart={onGalleryTouchStart} onTouchEnd={onGalleryTouchEnd}>
            <img className="swipeCard__photo" src={current.photos[photoIndex]} alt={current.name} />
            <div className="swipeCard__galleryActions">
              <button type="button" className="galleryArrow" onClick={prevPhoto} disabled={photoIndex === 0}>
                ‹
              </button>
              <button
                type="button"
                className="galleryArrow"
                onClick={nextPhoto}
                disabled={photoIndex === maxPhotoIndex}
              >
                ›
              </button>
            </div>
            <div className="swipeCard__dots">
              {current.photos.map((_, i) => (
                <span key={`${current.id}-dot-${i}`} className={`swipeCard__dot ${i === photoIndex ? 'is-active' : ''}`} />
              ))}
            </div>
          </div>
          <div className="swipeCard__overlay" onClick={openDetails}>
            <h3 className="swipeCard__title">{current.name}</h3>
            <p className="swipeCard__vibe">{current.vibe}</p>
            <div className="swipeCard__hints">← не нравится · нравится → · нажми для деталей</div>
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
        <div className="placeModalBackdrop" onClick={() => setDetailsOpen(false)}>
          <div className="placeModal" onClick={(e) => e.stopPropagation()}>
            <h3 className="placeModal__title">{current.name}</h3>
            <div className="placeModal__meta">
              <div>Местоположение: {current.location}</div>
              <div>Метро: {current.metro}</div>
              <div>Время работы: {current.hours}</div>
              <div>Средний чек: {current.avgCheck}</div>
            </div>
            <p className="placeModal__desc">{current.description}</p>
            <div className="placeModal__blockTitle">Меню</div>
            <div className="placeModal__chips">
              {current.menu.map((item) => (
                <span key={`${current.id}-menu-${item}`} className="placeModal__chip">
                  {item}
                </span>
              ))}
            </div>
            <div className="placeModal__blockTitle">Отзывы</div>
            <div className="placeModal__reviews">
              {current.reviews.map((r, idx) => (
                <div className="placeModal__review" key={`${current.id}-review-${idx}`}>
                  <div className="placeModal__reviewHead">
                    {r.author} · {r.rating}/5
                  </div>
                  <div>{r.text}</div>
                </div>
              ))}
            </div>
            <div className="swipeActions">
              <button type="button" className="actionBtn" onClick={closeAndAdvanceDislike}>
                Не нравится
              </button>
              <button type="button" className="actionBtn actionBtn--primary" onClick={closeAndAdvanceLike}>
                Нравится
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
};

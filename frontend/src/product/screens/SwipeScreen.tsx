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
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const current = useMemo(() => places[index % places.length], [index, places]);
  const next = useMemo(() => places[(index + 1) % places.length], [index, places]);

  if (!current) return null;

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

  return (
    <section className="screen">
      <h2 className="screen__title">Лента вайбов</h2>
      <div className="swipeDeck">
        {next ? (
          <div className="swipeCard swipeCard--next" aria-hidden>
            <img className="swipeCard__photo" src={next.photo} alt="" />
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
        <img className="swipeCard__photo" src={current.photo} alt={current.name} />
        <div className="swipeCard__overlay">
          <h3 className="swipeCard__title">{current.name}</h3>
          <p className="swipeCard__vibe">{current.vibe}</p>
          <div className="swipeCard__hints">← не нравится · нравится →</div>
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
    </section>
  );
};

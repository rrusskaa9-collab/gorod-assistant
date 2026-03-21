import { useMemo, useRef } from 'react';
import type { Place } from '../types';

type Props = {
  places: Place[];
  index: number;
  onSwipeLike: (place: Place) => void;
  onSwipeDislike: (place: Place) => void;
};

export const SwipeScreen = ({ places, index, onSwipeLike, onSwipeDislike }: Props) => {
  const startX = useRef<number | null>(null);
  const current = useMemo(() => places[index % places.length], [index, places]);

  if (!current) return null;

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    startX.current = e.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const x0 = startX.current;
    const x1 = e.changedTouches[0]?.clientX;
    if (x0 == null || x1 == null) return;
    const dx = x1 - x0;
    if (dx > 50) onSwipeLike(current);
    if (dx < -50) onSwipeDislike(current);
  };

  return (
    <section className="screen">
      <h2 className="screen__title">Лента вайбов</h2>
      <div className="swipeCard" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        <img className="swipeCard__photo" src={current.photo} alt={current.name} />
        <div className="swipeCard__overlay">
          <h3 className="swipeCard__title">{current.name}</h3>
          <p className="swipeCard__vibe">{current.vibe}</p>
          <div className="swipeCard__hints">← не нравится · нравится →</div>
        </div>
      </div>
      <div className="swipeActions">
        <button className="actionBtn" onClick={() => onSwipeDislike(current)}>
          Не нравится
        </button>
        <button className="actionBtn actionBtn--primary" onClick={() => onSwipeLike(current)}>
          Нравится
        </button>
      </div>
    </section>
  );
};

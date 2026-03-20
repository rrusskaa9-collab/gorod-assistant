import type { SearchEntity } from '../types';
import { useRef } from 'react';

type Props = {
  entity: SearchEntity;
  onClick?: () => void;
};

export const EntityCard = ({ entity, onClick }: Props) => {
  const lastActivateAt = useRef(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const activate = () => {
    // Защита от двойного вызова (pointer + click подряд).
    const now = Date.now();
    if (now - lastActivateAt.current < 250) return;
    lastActivateAt.current = now;
    onClick?.();
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      activate();
    }
  };

  const onTouchStart: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const t = e.changedTouches[0];
    if (!t) return;
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd: React.TouchEventHandler<HTMLDivElement> = (e) => {
    const start = touchStart.current;
    const t = e.changedTouches[0];
    if (!start || !t) return;

    const dx = Math.abs(t.clientX - start.x);
    const dy = Math.abs(t.clientY - start.y);

    // Если палец почти не двигался — считаем это тапом.
    if (dx < 10 && dy < 10) {
      activate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className="entityCard"
      onClick={activate}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      aria-label={`Открыть: ${entity.title}`}
    >
      <div className="entityCard__media">
        {/* Фото приходят с CDN. Для скорости используем lazy-loading. */}
        <img loading="lazy" className="entityCard__img" src={entity.imageUrl} alt={entity.title} />
      </div>

      <div className="entityCard__body">
        <div className="entityCard__title">{entity.title}</div>
        <div className="entityCard__meta">
          <span className="entityCard__type">{entity.subtitle}</span>
          {typeof entity.rating === 'number' ? (
            <span className="entityCard__rating">★ {entity.rating.toFixed(1)}</span>
          ) : null}
        </div>
      </div>
    </div>
  );
};


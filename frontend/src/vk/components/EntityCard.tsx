import type { SearchEntity } from '../types';

type Props = {
  entity: SearchEntity;
  onClick?: () => void;
};

export const EntityCard = ({ entity, onClick }: Props) => {
  return (
    <button
      type="button"
      className="entityCard"
      onClick={onClick}
      aria-label={`Открыть: ${entity.title}`}
    >
      <div className="entityCard__media">
        {/* Итерировать будем позже: в MVP фото — моковые */}
        <img className="entityCard__img" src={entity.imageUrl} alt={entity.title} />
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
    </button>
  );
};


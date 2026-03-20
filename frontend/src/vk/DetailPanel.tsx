import type { SearchEntity } from './types';

type Props = {
  entity: SearchEntity;
};

export const DetailPanel = ({ entity }: Props) => {
  return (
    <div className="detailPanel">
      <div className="detailPanel__media">
        <img src={entity.imageUrl} alt={entity.title} className="detailPanel__img" />
      </div>

      <div className="detailPanel__content">
        <h2 className="detailPanel__title">{entity.title}</h2>
        <div className="detailPanel__meta">
          <span className="detailPanel__type">{entity.subtitle}</span>
          {typeof entity.rating === 'number' ? (
            <span className="detailPanel__rating">★ {entity.rating.toFixed(1)}</span>
          ) : null}
        </div>

        <p className="detailPanel__text">
          Детальный экран MVP. На следующем этапе здесь появятся полные данные, отзывы и действия
          оценки.
        </p>

        {typeof entity.place_id === 'number' ? (
          <p className="detailPanel__hint">Связанное заведение ID: {entity.place_id}</p>
        ) : null}
      </div>
    </div>
  );
};


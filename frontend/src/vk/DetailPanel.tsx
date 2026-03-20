import { useEffect, useState } from 'react';
import type { ReviewsPage, SearchEntity } from './types';

type Props = {
  entity: SearchEntity;
};

export const DetailPanel = ({ entity }: Props) => {
  const [reviews, setReviews] = useState<ReviewsPage['items']>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);

  const restaurantId = entity.backend_id ?? null;

  const loadReviews = async (next: string | null, append: boolean) => {
    if (!restaurantId) return;
    setLoadingReviews(true);
    try {
      const query = next ? `&cursor=${encodeURIComponent(next)}` : '';
      const res = await fetch(`/v1/reviews?restaurant_id=${encodeURIComponent(restaurantId)}&limit=5${query}`);
      if (!res.ok) return;
      const page = (await res.json()) as ReviewsPage;
      setReviews((prev) => (append ? [...prev, ...page.items] : page.items));
      setCursor(page.next_cursor);
    } finally {
      setLoadingReviews(false);
    }
  };

  useEffect(() => {
    setReviews([]);
    setCursor(null);
    if (restaurantId) {
      void loadReviews(null, false);
    }
  }, [restaurantId]);

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

        <div className="reviewsBlock">
          <h3 className="reviewsBlock__title">Отзывы</h3>
          {reviews.map((r) => (
            <div className="reviewItem" key={r.id}>
              <div className="reviewItem__rating">★ {r.rating}</div>
              <div className="reviewItem__text">{r.text || 'Без текста'}</div>
            </div>
          ))}
          {loadingReviews ? <div className="loading">Загрузка отзывов...</div> : null}
          {!loadingReviews && cursor ? (
            <button className="reviewsBlock__more" onClick={() => void loadReviews(cursor, true)}>
              Загрузить ещё
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};


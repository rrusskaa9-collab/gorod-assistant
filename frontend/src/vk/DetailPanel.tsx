import { useEffect, useMemo, useState } from 'react';
import type { ReviewsPage, SearchEntity } from './types';

type Props = {
  entity: SearchEntity;
};

export const DetailPanel = ({ entity }: Props) => {
  const [reviews, setReviews] = useState<ReviewsPage['items']>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [serviceRating, setServiceRating] = useState(4);
  const [aestheticRating, setAestheticRating] = useState(4);
  const [tasteRating, setTasteRating] = useState(4);
  const [newText, setNewText] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [menuQuery, setMenuQuery] = useState('');
  const [selectedDish, setSelectedDish] = useState('Бургер');
  const [selectedPlace, setSelectedPlace] = useState('Neon Burger');
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null);

  const restaurantId = entity.backend_id ?? null;
  const entityKind = entity.entity_type;

  const menuItems = useMemo(
    () => ['Бургер', 'Паста', 'Салат', 'Суп', 'Десерт', 'Лимонад', 'Кофе'],
    [],
  );
  const placeOptions = useMemo(
    () => ['Neon Burger', 'Лес & Кофе', 'Бар у Рейна', 'Basilico', 'Mia Cucina'],
    [],
  );

  const searchTitle =
    entityKind === 'place'
      ? 'Поиск по меню'
      : entityKind === 'dish'
        ? 'Поиск по ресторанам и барам'
        : 'Поиск по барам и ресторанам';

  const contextOptions = entityKind === 'place' ? menuItems : placeOptions;
  const filteredContextOptions = contextOptions.filter((item) =>
    item.toLowerCase().includes(menuQuery.trim().toLowerCase()),
  );

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

  const submitReview = async () => {
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      const overallRating =
        entityKind === 'place'
          ? Number(((serviceRating + aestheticRating) / 2).toFixed(1))
          : Number(tasteRating.toFixed(1));

      const payload = {
        user_id: '00000000-0000-0000-0000-000000000001',
        restaurant_id: restaurantId,
        dish_id: entityKind === 'dish' ? entity.backend_id ?? null : null,
        drink_id: entityKind === 'drink' ? entity.backend_id ?? null : null,
        rating: Math.max(1, Math.min(5, Math.round(overallRating))),
        text: newText.trim() || null,
      };
      if (entityKind === 'place' && restaurantId && !restaurantId.startsWith('fallback:')) {
        const res = await fetch('/v1/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error(`submit status ${res.status}`);
        }
      }

      setNewText('');
      setPhotoPreview(null);
      setSubmitStatus('Отзыв отправлен');
      if (entityKind === 'place' && restaurantId && !restaurantId.startsWith('fallback:')) {
        await loadReviews(null, false);
      } else {
        const localReview = {
          id: `local-${Date.now()}`,
          user_id: 'local-user',
          rating: Math.max(1, Math.min(5, Math.round(overallRating))),
          text: newText.trim() || null,
          created_at: new Date().toISOString(),
        };
        setReviews((prev) => [localReview, ...prev]);
      }
    } catch {
      const localReview = {
        id: `local-${Date.now()}`,
        user_id: 'local-user',
        rating: entityKind === 'place' ? Math.round((serviceRating + aestheticRating) / 2) : tasteRating,
        text: newText.trim() || null,
        created_at: new Date().toISOString(),
      };
      setReviews((prev) => [localReview, ...prev]);
      setNewText('');
      setPhotoPreview(null);
      setSubmitStatus('Сеть недоступна: отзыв сохранен локально');
    } finally {
      setSubmitting(false);
    }
  };

  const uiReviews = useMemo(() => {
    const fromApi = reviews.map((r, idx) => ({
      id: r.id,
      author: r.user_id === 'local-user' ? 'Вы' : `Пользователь ${idx + 1}`,
      rating: r.rating,
      text: r.text || 'Без текста',
      photoUrl: photoPreview && idx === 0 ? photoPreview : `https://picsum.photos/seed/rev-${r.id}/720/420.webp`,
      createdAt: new Date(r.created_at).toLocaleDateString('ru-RU'),
    }));
    if (fromApi.length > 0) return fromApi;
    return [
      {
        id: 'seed-1',
        author: 'Анна',
        rating: 5,
        text: 'Очень понравилось, вернусь еще.',
        photoUrl: 'https://picsum.photos/seed/seed-review-1/720/420.webp',
        createdAt: 'сегодня',
      },
      {
        id: 'seed-2',
        author: 'Илья',
        rating: 4,
        text: 'Хорошо, но вечером бывает очередь.',
        photoUrl: 'https://picsum.photos/seed/seed-review-2/720/420.webp',
        createdAt: 'вчера',
      },
    ];
  }, [reviews, photoPreview]);

  const onPhotoPick: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const local = URL.createObjectURL(file);
    setPhotoPreview(local);
  };

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
          <h3 className="reviewsBlock__title">{searchTitle}</h3>
          <input
            className="mainPanel__searchInput"
            placeholder={searchTitle}
            value={menuQuery}
            onChange={(e) => setMenuQuery(e.target.value)}
          />
          <div className="contextList" role="list">
            {filteredContextOptions.slice(0, 6).map((option) => (
              <button
                key={option}
                className="contextList__item"
                onClick={() => {
                  if (entityKind === 'place') setSelectedDish(option);
                  else setSelectedPlace(option);
                }}
              >
                {option}
              </button>
            ))}
          </div>

          <h3 className="reviewsBlock__title">Отзывы</h3>
          <div className="reviewForm">
            <button className="reviewForm__submit" onClick={() => void submitReview()} disabled={submitting}>
              {submitting ? 'Отправляем...' : 'Оставить отзыв'}
            </button>
            {entityKind === 'place' ? (
              <>
                <div className="reviewForm__row reviewForm__sliderRow">
                  <label className="reviewForm__label" htmlFor="service-slider">
                    Сервис: {serviceRating}
                  </label>
                  <input
                    id="service-slider"
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={serviceRating}
                    onChange={(e) => setServiceRating(Number(e.target.value))}
                    className="reviewForm__slider"
                  />
                </div>
                <div className="reviewForm__row reviewForm__sliderRow">
                  <label className="reviewForm__label" htmlFor="aesthetic-slider">
                    Эстетика: {aestheticRating}
                  </label>
                  <input
                    id="aesthetic-slider"
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={aestheticRating}
                    onChange={(e) => setAestheticRating(Number(e.target.value))}
                    className="reviewForm__slider"
                  />
                </div>
                <div className="reviewForm__row">
                  <label className="reviewForm__label" htmlFor="dish-select">
                    Блюдо
                  </label>
                  <select
                    id="dish-select"
                    className="reviewForm__select"
                    value={selectedDish}
                    onChange={(e) => setSelectedDish(e.target.value)}
                  >
                    {menuItems.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="reviewForm__row reviewForm__sliderRow">
                  <label className="reviewForm__label" htmlFor="taste-slider">
                    Вкус: {tasteRating}
                  </label>
                  <input
                    id="taste-slider"
                    type="range"
                    min={1}
                    max={5}
                    step={1}
                    value={tasteRating}
                    onChange={(e) => setTasteRating(Number(e.target.value))}
                    className="reviewForm__slider"
                  />
                </div>
                <div className="reviewForm__row">
                  <label className="reviewForm__label" htmlFor="place-select">
                    {entityKind === 'dish' ? 'Ресторан/бар' : 'Бар/ресторан'}
                  </label>
                  <select
                    id="place-select"
                    className="reviewForm__select"
                    value={selectedPlace}
                    onChange={(e) => setSelectedPlace(e.target.value)}
                  >
                    {placeOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
            <textarea
              className="reviewForm__textarea"
              placeholder="Текст отзыва (необязательно)"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
            <div className="reviewForm__row">
              <label className="reviewForm__label" htmlFor="photo-upload">
                Фото
              </label>
              <input id="photo-upload" type="file" accept="image/*" capture="environment" onChange={onPhotoPick} />
            </div>
            {photoPreview ? <img className="reviewForm__preview" src={photoPreview} alt="Предпросмотр фото" /> : null}
            {submitStatus ? <div className="loading">{submitStatus}</div> : null}
          </div>

          {uiReviews.map((r) => (
            <div
              className="reviewItem reviewItem--expandable"
              key={r.id}
              role="button"
              tabIndex={0}
              onClick={() => setExpandedReviewId((prev) => (prev === r.id ? null : r.id))}
            >
              <div className="reviewItem__rating">★ {r.rating} · {r.author}</div>
              <div className="reviewItem__text">{r.text}</div>
              {expandedReviewId === r.id ? (
                <>
                  {r.photoUrl ? <img className="reviewItem__photo" src={r.photoUrl} alt="Фото отзыва" /> : null}
                  <div className="reviewItem__meta">{r.createdAt}</div>
                </>
              ) : (
                <div className="reviewItem__hint">Нажмите, чтобы раскрыть</div>
              )}
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


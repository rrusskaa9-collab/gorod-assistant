import { useState } from 'react';
import { PLACES } from './product/mockPlaces';
import { SavedScreen } from './product/screens/SavedScreen';
import { SwipeScreen } from './product/screens/SwipeScreen';
import type { Place } from './product/types';
import './product/product.css';

export default function App() {
  const [tab, setTab] = useState<'swipe' | 'saved'>('swipe');
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);

  const like = (place: Place) => {
    setLikedIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setDislikedIds((prev) => prev.filter((id) => id !== place.id));
    setSwipeIndex((x) => x + 1);
  };

  const dislike = (place: Place) => {
    setDislikedIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setSwipeIndex((x) => x + 1);
  };

  return (
    <div className="appShell">
      {tab === 'swipe' ? (
        <SwipeScreen places={PLACES} index={swipeIndex} onSwipeLike={like} onSwipeDislike={dislike} />
      ) : null}
      {tab === 'saved' ? <SavedScreen places={PLACES} savedIds={likedIds} /> : null}

      <nav className="bottomNav">
        <button
          type="button"
          className={`bottomNav__btn ${tab === 'swipe' ? 'is-active' : ''}`}
          onClick={() => setTab('swipe')}
        >
          Swipe
        </button>
        <button
          type="button"
          className={`bottomNav__btn ${tab === 'saved' ? 'is-active' : ''}`}
          onClick={() => setTab('saved')}
        >
          Saved
        </button>
      </nav>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { PLACES } from './product/mockPlaces';
import { HomeScreen } from './product/screens/HomeScreen';
import { MapScreen } from './product/screens/MapScreen';
import { SavedScreen } from './product/screens/SavedScreen';
import { SwipeScreen } from './product/screens/SwipeScreen';
import type { Place } from './product/types';
import './product/product.css';

export default function App() {
  const [tab, setTab] = useState<'home' | 'swipe' | 'map' | 'saved'>('home');
  const [likedIds, setLikedIds] = useState<string[]>([]);
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const [swipeIndex, setSwipeIndex] = useState(0);

  const signals = useMemo(
    () => ({ likedIds, dislikedIds, checkedInIds }),
    [likedIds, dislikedIds, checkedInIds],
  );

  const like = (place: Place) => {
    setLikedIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setDislikedIds((prev) => prev.filter((id) => id !== place.id));
    setSwipeIndex((x) => x + 1);
  };

  const dislike = (place: Place) => {
    setDislikedIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setSwipeIndex((x) => x + 1);
  };

  const checkIn = (place: Place) => {
    setCheckedInIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
    setLikedIds((prev) => (prev.includes(place.id) ? prev : [...prev, place.id]));
  };

  return (
    <div className="appShell">
      {tab === 'home' ? (
        <HomeScreen places={PLACES} signals={signals} onLike={like} onCheckIn={checkIn} />
      ) : null}
      {tab === 'swipe' ? (
        <SwipeScreen places={PLACES} index={swipeIndex} onSwipeLike={like} onSwipeDislike={dislike} />
      ) : null}
      {tab === 'map' ? <MapScreen places={PLACES} onCheckIn={checkIn} /> : null}
      {tab === 'saved' ? <SavedScreen places={PLACES} savedIds={likedIds} /> : null}

      <nav className="bottomNav">
        <button className={`bottomNav__btn ${tab === 'home' ? 'is-active' : ''}`} onClick={() => setTab('home')}>
          Home
        </button>
        <button className={`bottomNav__btn ${tab === 'swipe' ? 'is-active' : ''}`} onClick={() => setTab('swipe')}>
          Swipe
        </button>
        <button className={`bottomNav__btn ${tab === 'map' ? 'is-active' : ''}`} onClick={() => setTab('map')}>
          Map
        </button>
        <button className={`bottomNav__btn ${tab === 'saved' ? 'is-active' : ''}`} onClick={() => setTab('saved')}>
          Saved
        </button>
      </nav>
    </div>
  );
}

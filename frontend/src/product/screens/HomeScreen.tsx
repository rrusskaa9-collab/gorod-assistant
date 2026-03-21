import { PlaceHeroCard } from '../components/PlaceHeroCard';
import { getTopRecommendations } from '../recommendation';
import type { Place, UserSignals } from '../types';

type Props = {
  places: Place[];
  signals: UserSignals;
  onLike: (place: Place) => void;
  onCheckIn: (place: Place) => void;
};

export const HomeScreen = ({ places, signals, onLike, onCheckIn }: Props) => {
  const top = getTopRecommendations(places, signals, 3);

  return (
    <section className="screen screen--home">
      <h2 className="screen__title">3 варианта на сегодня</h2>
      <div className="stack3">
        {top.map((place) => (
          <PlaceHeroCard key={place.id} place={place} signals={signals} onLike={onLike} onGo={onCheckIn} />
        ))}
      </div>
    </section>
  );
};

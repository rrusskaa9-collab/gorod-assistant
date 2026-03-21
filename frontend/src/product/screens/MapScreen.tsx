import { useMemo, useState } from 'react';
import type { Place } from '../types';

type Props = {
  places: Place[];
  onCheckIn: (place: Place) => void;
};

export const MapScreen = ({ places, onCheckIn }: Props) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const bounds = useMemo(() => {
    const lats = places.map((p) => p.lat);
    const lngs = places.map((p) => p.lng);
    return {
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
    };
  }, [places]);

  const selected = places.find((p) => p.id === selectedId) ?? null;

  const normalize = (value: number, min: number, max: number) => {
    if (max === min) return 50;
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <section className="screen">
      <h2 className="screen__title">Карта</h2>
      <div className="mapCanvas">
        {places.map((p) => {
          const left = normalize(p.lng, bounds.minLng, bounds.maxLng);
          const top = normalize(p.lat, bounds.minLat, bounds.maxLat);
          return (
            <button
              key={p.id}
              className={`mapDot ${selectedId === p.id ? 'is-active' : ''}`}
              style={{ left: `${left}%`, top: `${100 - top}%` }}
              onClick={() => setSelectedId(p.id)}
              aria-label={p.name}
            />
          );
        })}
      </div>
      {selected ? (
        <div className="mapPlaceCard">
          <img src={selected.photos[0]} className="mapPlaceCard__photo" alt={selected.name} />
          <div>
            <div className="mapPlaceCard__name">{selected.name}</div>
            <div className="mapPlaceCard__vibe">{selected.vibe}</div>
            <button className="actionBtn actionBtn--primary" onClick={() => onCheckIn(selected)}>
              Я здесь
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
};

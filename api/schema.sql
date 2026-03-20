CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "postgis";

CREATE TABLE IF NOT EXISTS restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Ресторан', 'Бар', 'Кафе')),
  city TEXT NOT NULL,
  address TEXT,
  location GEOGRAPHY(Point, 4326) NOT NULL,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drinks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0,
  reviews_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
  drink_id UUID REFERENCES drinks(id) ON DELETE SET NULL,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (
    (dish_id IS NULL AND drink_id IS NULL) OR
    (dish_id IS NOT NULL AND drink_id IS NULL) OR
    (dish_id IS NULL AND drink_id IS NOT NULL)
  )
);

CREATE TABLE IF NOT EXISTS review_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
  preview_url TEXT NOT NULL,
  full_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_restaurants_location_gist ON restaurants USING GIST (location);
CREATE INDEX IF NOT EXISTS idx_restaurants_city_rating ON restaurants(city, rating_avg DESC, reviews_count DESC);
CREATE INDEX IF NOT EXISTS idx_restaurants_name_trgm ON restaurants USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_dishes_name_trgm ON dishes USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_drinks_name_trgm ON drinks USING GIN (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_reviews_restaurant_created ON reviews(restaurant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_dish_created ON reviews(dish_id, created_at DESC) WHERE dish_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_reviews_drink_created ON reviews(drink_id, created_at DESC) WHERE drink_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_review_photos_review ON review_photos(review_id);

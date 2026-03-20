INSERT INTO restaurants (name, category, city, address, location, rating_avg, reviews_count)
VALUES
('Лес & Кофе', 'Кафе', 'Москва', 'ул. Тверская, 1', ST_SetSRID(ST_MakePoint(37.6176,55.7558),4326)::geography, 4.70, 120),
('Neon Burger', 'Ресторан', 'Москва', 'ул. Арбат, 9', ST_SetSRID(ST_MakePoint(37.6049,55.7520),4326)::geography, 4.60, 98),
('Бар у Рейна', 'Бар', 'Москва', 'ул. Пятницкая, 20', ST_SetSRID(ST_MakePoint(37.6260,55.7410),4326)::geography, 4.50, 87),
('Солёная Волна', 'Ресторан', 'Москва', 'ул. Лесная, 5', ST_SetSRID(ST_MakePoint(37.5850,55.7790),4326)::geography, 4.80, 211),
('Кофейная Линия', 'Кафе', 'Москва', 'ул. Сретенка, 3', ST_SetSRID(ST_MakePoint(37.6310,55.7650),4326)::geography, 4.40, 73)
ON CONFLICT DO NOTHING;

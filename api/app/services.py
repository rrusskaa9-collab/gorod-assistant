from .db import get_pool


async def refresh_restaurant_rating(restaurant_id: str) -> None:
    async with get_pool().acquire() as conn:
        await conn.execute(
            """
            UPDATE restaurants r
            SET
              rating_avg = COALESCE(s.avg_rating, 0),
              reviews_count = COALESCE(s.cnt, 0)
            FROM (
              SELECT restaurant_id, ROUND(AVG(rating)::numeric, 2) AS avg_rating, COUNT(*) AS cnt
              FROM reviews
              WHERE restaurant_id = $1
              GROUP BY restaurant_id
            ) s
            WHERE r.id = s.restaurant_id
            """,
            restaurant_id,
        )

import os
from base64 import urlsafe_b64decode, urlsafe_b64encode
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, HTTPException, Query

from .cache import cache_get_json, cache_set_json, close_redis, connect_redis
from .db import close_db, connect_db, get_pool
from .schemas import (
    CardOut,
    MapClusterOut,
    MapPointOut,
    ReviewCreate,
    ReviewsPageOut,
    ReviewOut,
    SearchOut,
)
from .services import refresh_restaurant_rating

CACHE_TTL_SEC = int(os.getenv("API_CACHE_TTL_SEC", "600"))


@asynccontextmanager
async def lifespan(_: FastAPI):
    await connect_db()
    await connect_redis()
    yield
    await close_redis()
    await close_db()


app = FastAPI(title="City API", version="0.1.0", lifespan=lifespan)


def encode_cursor(ts: datetime, row_id: str) -> str:
    raw = f"{ts.astimezone(timezone.utc).isoformat()}|{row_id}"
    return urlsafe_b64encode(raw.encode("utf-8")).decode("utf-8")


def decode_cursor(cursor: str) -> tuple[datetime, str]:
    try:
        raw = urlsafe_b64decode(cursor.encode("utf-8")).decode("utf-8")
        ts_raw, row_id = raw.split("|", 1)
        ts = datetime.fromisoformat(ts_raw)
        return ts, row_id
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid cursor") from exc


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/v1/restaurants/popular", response_model=list[CardOut])
async def restaurants_popular(limit: int = Query(default=10, ge=1, le=20)):
    key = f"popular:{limit}"
    cached = await cache_get_json(key)
    if cached is not None:
        return cached

    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id::text, name, category, rating_avg
            FROM restaurants
            ORDER BY rating_avg DESC, reviews_count DESC
            LIMIT $1
            """,
            limit,
        )
    payload = [
        {
            "id": r["id"],
            "title": r["name"],
            "image": f"https://picsum.photos/seed/{r['id']}/512/320.webp",
            "rating": float(r["rating_avg"]),
            "category": r["category"],
        }
        for r in rows
    ]
    await cache_set_json(key, payload, ttl_sec=CACHE_TTL_SEC)
    return payload


@app.get("/v1/restaurants/near", response_model=list[CardOut])
async def restaurants_near(
    lat: float,
    lng: float,
    radius: int = Query(default=3000, ge=100, le=50000),
    limit: int = Query(default=20, ge=1, le=50),
):
    key = f"near:{round(lat,4)}:{round(lng,4)}:{radius}:{limit}"
    cached = await cache_get_json(key)
    if cached is not None:
        return cached

    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """
            SELECT id::text, name, category, rating_avg
            FROM restaurants
            WHERE ST_DWithin(
                location,
                ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
                $3
            )
            ORDER BY rating_avg DESC, reviews_count DESC
            LIMIT $4
            """,
            lng,
            lat,
            radius,
            limit,
        )
    payload = [
        {
            "id": r["id"],
            "title": r["name"],
            "image": f"https://picsum.photos/seed/{r['id']}/512/320.webp",
            "rating": float(r["rating_avg"]),
            "category": r["category"],
        }
        for r in rows
    ]
    await cache_set_json(key, payload, ttl_sec=300)
    return payload


@app.get("/v1/restaurants/map", response_model=list[MapPointOut | MapClusterOut])
async def restaurants_map(
    min_lat: float,
    min_lng: float,
    max_lat: float,
    max_lng: float,
    zoom: int = Query(default=12, ge=1, le=22),
    limit: int = Query(default=1000, ge=1, le=2000),
):
    key = f"map:{round(min_lat,4)}:{round(min_lng,4)}:{round(max_lat,4)}:{round(max_lng,4)}:{zoom}:{limit}"
    cached = await cache_get_json(key)
    if cached is not None:
        return cached

    # Размер ячейки меняется от зума: меньше ячейка -> меньше кластеров на крупном масштабе.
    grid_deg = 0.08 / (2 ** max(0, zoom - 10))
    grid_deg = max(grid_deg, 0.001)

    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            """
            WITH visible AS (
              SELECT id, name, category, rating_avg, location::geometry AS g
              FROM restaurants
              WHERE g && ST_MakeEnvelope($1, $2, $3, $4, 4326)
              LIMIT $5
            ),
            clustered AS (
              SELECT
                ST_SnapToGrid(g, $6, $6) AS cell,
                COUNT(*) AS cnt,
                AVG(ST_Y(g)) AS lat,
                AVG(ST_X(g)) AS lng,
                MAX(rating_avg) AS rating
              FROM visible
              GROUP BY cell
            )
            SELECT
              md5(ST_AsText(cell)) AS cluster_id,
              cnt,
              lat,
              lng,
              rating
            FROM clustered
            ORDER BY cnt DESC
            """,
            min_lng,
            min_lat,
            max_lng,
            max_lat,
            limit,
            grid_deg,
        )

    payload: list[dict] = []
    for r in rows:
        if r["cnt"] == 1:
            payload.append(
                {
                    "id": r["cluster_id"],
                    "title": "Restaurant",
                    "lat": float(r["lat"]),
                    "lng": float(r["lng"]),
                    "rating": float(r["rating"] or 0),
                    "category": "mixed",
                    "kind": "point",
                }
            )
        else:
            payload.append(
                {
                    "id": r["cluster_id"],
                    "lat": float(r["lat"]),
                    "lng": float(r["lng"]),
                    "count": int(r["cnt"]),
                    "kind": "cluster",
                }
            )

    await cache_set_json(key, payload, ttl_sec=300)
    return payload


@app.get("/v1/reviews", response_model=ReviewsPageOut)
async def get_reviews(
    restaurant_id: str,
    limit: int = Query(default=10, ge=1, le=30),
    cursor: str | None = None,
):
    where_extra = ""
    args: list = [restaurant_id, limit + 1]
    if cursor:
        c_ts, c_id = decode_cursor(cursor)
        where_extra = "AND (created_at, id) < ($3::timestamptz, $4::uuid)"
        args.extend([c_ts, c_id])

    async with get_pool().acquire() as conn:
        rows = await conn.fetch(
            f"""
            SELECT id::text, user_id::text, rating, text, created_at
            FROM reviews
            WHERE restaurant_id = $1
            {where_extra}
            ORDER BY created_at DESC, id DESC
            LIMIT $2
            """,
            *args,
        )
    has_more = len(rows) > limit
    items = rows[:limit]

    next_cursor = None
    if has_more and items:
        last = items[-1]
        next_cursor = encode_cursor(last["created_at"], last["id"])

    return {
        "items": [
            {
                "id": r["id"],
                "user_id": r["user_id"],
                "rating": r["rating"],
                "text": r["text"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in items
        ],
        "next_cursor": next_cursor,
    }


@app.post("/v1/reviews")
async def create_review(payload: ReviewCreate):
    async with get_pool().acquire() as conn:
        await conn.execute(
            """
            INSERT INTO reviews (user_id, restaurant_id, dish_id, drink_id, rating, text)
            VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5, $6)
            """,
            payload.user_id,
            payload.restaurant_id,
            payload.dish_id,
            payload.drink_id,
            payload.rating,
            payload.text,
        )
    await refresh_restaurant_rating(payload.restaurant_id)
    return {"ok": True}


@app.get("/v1/search", response_model=list[SearchOut])
async def search(
    q: str = Query(min_length=1, max_length=64),
    type: str = Query(default="restaurant"),
    limit: int = Query(default=20, ge=1, le=20),
):
    query = f"%{q}%"
    async with get_pool().acquire() as conn:
        if type == "dish":
            rows = await conn.fetch(
                "SELECT id::text, name, rating_avg FROM dishes WHERE name ILIKE $1 ORDER BY rating_avg DESC LIMIT $2",
                query,
                limit,
            )
            return [{"id": r["id"], "type": "dish", "title": r["name"], "rating": float(r["rating_avg"])} for r in rows]
        if type == "drink":
            rows = await conn.fetch(
                "SELECT id::text, name, rating_avg FROM drinks WHERE name ILIKE $1 ORDER BY rating_avg DESC LIMIT $2",
                query,
                limit,
            )
            return [{"id": r["id"], "type": "drink", "title": r["name"], "rating": float(r["rating_avg"])} for r in rows]
        if type != "restaurant":
            raise HTTPException(status_code=400, detail="type must be restaurant|dish|drink")

        rows = await conn.fetch(
            "SELECT id::text, name, rating_avg FROM restaurants WHERE name ILIKE $1 ORDER BY rating_avg DESC LIMIT $2",
            query,
            limit,
        )
        return [{"id": r["id"], "type": "restaurant", "title": r["name"], "rating": float(r["rating_avg"])} for r in rows]


@app.post("/v1/uploads/presign")
async def presign_upload():
    # MVP mock: в проде здесь создается signed URL в S3.
    return {
        "upload_url": "https://example-bucket.s3.amazonaws.com/mock-upload",
        "preview_url": "https://cdn.example.com/review/preview.webp",
        "full_url": "https://cdn.example.com/review/full.webp",
    }

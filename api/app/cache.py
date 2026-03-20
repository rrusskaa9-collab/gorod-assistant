import os

import orjson
from redis.asyncio import Redis

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
_redis: Redis | None = None


async def connect_redis() -> None:
    global _redis
    if _redis is None:
        _redis = Redis.from_url(REDIS_URL, decode_responses=False)
        await _redis.ping()


async def close_redis() -> None:
    global _redis
    if _redis is not None:
        await _redis.aclose()
        _redis = None


def redis_client() -> Redis:
    if _redis is None:
        raise RuntimeError("Redis client is not initialized")
    return _redis


async def cache_get_json(key: str):
    raw = await redis_client().get(key)
    if raw is None:
        return None
    return orjson.loads(raw)


async def cache_set_json(key: str, payload, ttl_sec: int) -> None:
    await redis_client().set(key, orjson.dumps(payload), ex=ttl_sec)

import os
from pathlib import Path

import asyncpg

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://city:city@localhost:5432/citydb")
_pool: asyncpg.Pool | None = None


async def connect_db() -> None:
    global _pool
    if _pool is None:
        _pool = await asyncpg.create_pool(DATABASE_URL, min_size=2, max_size=20)
        await apply_schema()
        await seed_if_empty()


async def close_db() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("DB pool is not initialized")
    return _pool


async def apply_schema() -> None:
    schema_path = Path(__file__).resolve().parents[1] / "schema.sql"
    sql = schema_path.read_text(encoding="utf-8")
    async with get_pool().acquire() as conn:
        await conn.execute(sql)


async def seed_if_empty() -> None:
    async with get_pool().acquire() as conn:
        count = await conn.fetchval("SELECT COUNT(*) FROM restaurants;")
        if count and int(count) > 0:
            return
        seed_path = Path(__file__).resolve().parents[1] / "seed.sql"
        await conn.execute(seed_path.read_text(encoding="utf-8"))

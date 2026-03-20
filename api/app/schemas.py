from pydantic import BaseModel, Field


class CardOut(BaseModel):
    id: str
    title: str
    image: str
    rating: float
    category: str


class ReviewOut(BaseModel):
    id: str
    user_id: str
    rating: int
    text: str | None
    created_at: str


class ReviewsPageOut(BaseModel):
    items: list[ReviewOut]
    next_cursor: str | None = None


class ReviewCreate(BaseModel):
    user_id: str
    restaurant_id: str
    dish_id: str | None = None
    drink_id: str | None = None
    rating: int = Field(ge=1, le=5)
    text: str | None = None


class SearchOut(BaseModel):
    id: str
    type: str
    title: str
    rating: float | None = None


class MapPointOut(BaseModel):
    id: str
    title: str
    lat: float
    lng: float
    rating: float
    category: str
    kind: str = "point"


class MapClusterOut(BaseModel):
    id: str
    lat: float
    lng: float
    count: int
    kind: str = "cluster"

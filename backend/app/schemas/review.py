from pydantic import BaseModel
from typing import Optional


class ReviewCreate(BaseModel):
    product_id: int
    rating: float
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    rating: float
    comment: Optional[str]

    class Config:
        from_attributes = True
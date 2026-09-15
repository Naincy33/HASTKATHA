from pydantic import BaseModel
from typing import Optional


class ProductCreate(BaseModel):
    craft_id: int
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 1
    material: Optional[str] = None
    dimensions: Optional[str] = None
    production_time_days: Optional[int] = None


class ProductResponse(BaseModel):
    id: int
    artisan_id: int
    craft_id: int
    name: str
    description: Optional[str]
    price: float
    stock: int
    material: Optional[str]
    dimensions: Optional[str]
    production_time_days: Optional[int]
    is_active: bool

    class Config:
        from_attributes = True
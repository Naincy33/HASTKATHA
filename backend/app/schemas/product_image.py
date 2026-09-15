from pydantic import BaseModel


class ProductImageCreate(BaseModel):
    product_id: int
    image_url: str
    is_primary: bool = False


class ProductImageResponse(BaseModel):
    id: int
    product_id: int
    image_url: str
    is_primary: bool

    class Config:
        from_attributes = True
from typing import Literal
from pydantic import BaseModel, Field, ConfigDict, EmailStr


class OrderItemCreate(BaseModel):
    product_id: int = Field(gt=0)
    quantity: int = Field(ge=1, le=100)


class OrderCreate(BaseModel):
    items: list[OrderItemCreate] = Field(min_length=1, max_length=100)
    shipping_name: str = Field(min_length=2, max_length=120)
    shipping_email: EmailStr
    shipping_phone: str = Field(min_length=10, max_length=20)
    shipping_address: str = Field(min_length=5, max_length=2000)
    shipping_city: str = Field(min_length=2, max_length=100)
    shipping_state: str = Field(min_length=2, max_length=100)
    shipping_pincode: str = Field(pattern=r"^\d{6}$")
    payment_method: Literal["cod"] = "cod"


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    price: float


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    total_amount: float
    status: str
    shipping_name: str | None = None
    shipping_email: str | None = None
    shipping_phone: str | None = None
    shipping_address: str | None = None
    shipping_city: str | None = None
    shipping_state: str | None = None
    shipping_pincode: str | None = None
    payment_method: str | None = None
    items: list[OrderItemResponse] = Field(default_factory=list)

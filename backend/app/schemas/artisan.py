from pydantic import BaseModel
from typing import Optional


class ArtisanCreate(BaseModel):
    business_name: str
    bio: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None


class ArtisanResponse(BaseModel):
    id: int
    user_id: int
    business_name: str
    bio: Optional[str]
    state: Optional[str]
    district: Optional[str]
    verification_status: str

    class Config:
        from_attributes = True
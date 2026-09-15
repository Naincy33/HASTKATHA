from pydantic import BaseModel
from typing import Optional


class CraftCreate(BaseModel):
    name: str
    description: Optional[str] = None
    state: Optional[str] = None
    region: Optional[str] = None
    material: Optional[str] = None
    technique: Optional[str] = None
    gi_status: Optional[str] = "unknown"


class CraftResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    state: Optional[str]
    region: Optional[str]
    material: Optional[str]
    technique: Optional[str]
    gi_status: str

    class Config:
        from_attributes = True
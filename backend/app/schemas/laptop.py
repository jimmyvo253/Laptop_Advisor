from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LaptopBase(BaseModel):
    name: str
    performance: float
    resolution: float
    capacity: float
    portability: float
    battery: float
    price: float

class LaptopCreate(LaptopBase):
    pass

class LaptopUpdate(BaseModel):
    name: Optional[str] = None
    performance: Optional[float] = None
    resolution: Optional[float] = None
    capacity: Optional[float] = None
    portability: Optional[float] = None
    battery: Optional[float] = None
    price: Optional[float] = None

class Laptop(LaptopBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

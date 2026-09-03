from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal

class ItineraryItemBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: str = "SIGHTSEEING"
    estimated_cost: Decimal = Decimal("0.0")
    currency: str = "USD"
    order_index: int = 0
    notes: Optional[str] = None
    is_completed: bool = False

class ItineraryItemCreate(ItineraryItemBase):
    day_id: str

class ItineraryItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    location_name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    category: Optional[str] = None
    estimated_cost: Optional[Decimal] = None
    currency: Optional[str] = None
    order_index: Optional[int] = None
    notes: Optional[str] = None
    is_completed: Optional[bool] = None
    day_id: Optional[str] = None

class ItineraryItemReorder(BaseModel):
    item_id: str
    day_id: str
    order_index: int

class ItineraryItemBatchReorder(BaseModel):
    items: List[ItineraryItemReorder]

class ItineraryItemOut(ItineraryItemBase):
    id: str
    day_id: str
    trip_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class ItineraryDayBase(BaseModel):
    day_number: int
    date: Optional[datetime] = None
    notes: Optional[str] = None

class ItineraryDayCreate(ItineraryDayBase):
    trip_id: Optional[str] = None

class ItineraryDayUpdate(BaseModel):
    notes: Optional[str] = None
    date: Optional[datetime] = None

class ItineraryDayOut(ItineraryDayBase):
    id: str
    trip_id: str
    created_at: datetime
    items: List[ItineraryItemOut] = []

    model_config = ConfigDict(from_attributes=True)

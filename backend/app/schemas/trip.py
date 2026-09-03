from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal
from backend.app.schemas.user import UserOut

class TripMemberBase(BaseModel):
    user_id: str
    role: str = "VIEWER"

class TripMemberCreate(BaseModel):
    user_id_or_email: str
    role: str = "VIEWER"

class TripMemberUpdate(BaseModel):
    role: str

class TripMemberOut(BaseModel):
    id: str
    trip_id: str
    user_id: str
    role: str
    joined_at: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class TripBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    destination: str = Field(..., min_length=1, max_length=255)
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    start_date: datetime
    end_date: datetime
    budget: Decimal = Decimal("0.0")
    currency: str = "USD"
    cover_image: Optional[str] = None
    status: str = "PLANNING"

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    destination: Optional[str] = None
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[Decimal] = None
    currency: Optional[str] = None
    cover_image: Optional[str] = None
    status: Optional[str] = None

class TripOut(TripBase):
    id: str
    owner_id: str
    created_at: datetime
    updated_at: datetime
    owner: Optional[UserOut] = None
    members: List[TripMemberOut] = []
    user_role: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class TripSummary(BaseModel):
    id: str
    title: str
    destination: str
    destination_lat: Optional[float] = None
    destination_lng: Optional[float] = None
    start_date: datetime
    end_date: datetime
    status: str
    budget: Decimal
    currency: str
    cover_image: Optional[str] = None
    member_count: int = 1
    user_role: str = "OWNER"

    model_config = ConfigDict(from_attributes=True)

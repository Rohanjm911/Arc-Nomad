from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from backend.app.schemas.user import UserOut

class FlightStatusHistoryOut(BaseModel):
    id: str
    old_status: Optional[str] = None
    new_status: str
    message: Optional[str] = None
    changed_at: datetime

    model_config = ConfigDict(from_attributes=True)

class FlightBase(BaseModel):
    airline: str = Field(..., min_length=1, max_length=100)
    flight_number: str = Field(..., min_length=1, max_length=50)
    departure_airport: str = Field(..., min_length=2, max_length=10)
    arrival_airport: str = Field(..., min_length=2, max_length=10)
    departure_city: Optional[str] = None
    arrival_city: Optional[str] = None
    departure_time: datetime
    arrival_time: datetime
    terminal: Optional[str] = None
    gate: Optional[str] = None
    status: str = "SCHEDULED"
    seat: Optional[str] = None
    booking_reference: Optional[str] = None
    notes: Optional[str] = None

class FlightCreate(FlightBase):
    trip_id: str
    user_id: Optional[str] = None

class FlightUpdate(BaseModel):
    airline: Optional[str] = None
    flight_number: Optional[str] = None
    departure_airport: Optional[str] = None
    arrival_airport: Optional[str] = None
    departure_city: Optional[str] = None
    arrival_city: Optional[str] = None
    departure_time: Optional[datetime] = None
    arrival_time: Optional[datetime] = None
    terminal: Optional[str] = None
    gate: Optional[str] = None
    status: Optional[str] = None
    seat: Optional[str] = None
    booking_reference: Optional[str] = None
    notes: Optional[str] = None

class FlightSimulateStatusRequest(BaseModel):
    new_status: str
    gate: Optional[str] = None
    terminal: Optional[str] = None
    delay_minutes: Optional[int] = None
    message: Optional[str] = None

class FlightOut(FlightBase):
    id: str
    trip_id: str
    user_id: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    user: Optional[UserOut] = None
    status_history: List[FlightStatusHistoryOut] = []

    model_config = ConfigDict(from_attributes=True)

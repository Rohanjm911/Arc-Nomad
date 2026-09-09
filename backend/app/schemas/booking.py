from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class BookingCreate(BaseModel):
    trip_id: str
    booking_type: str = Field(..., description="'HOTEL' or 'RESTAURANT'")
    title: str = Field(..., min_length=1, max_length=255)
    start_date: datetime
    end_date: Optional[datetime] = None
    time_slot: Optional[str] = None
    party_size: int = Field(default=2, ge=1, le=50)
    total_price: Optional[float] = None
    currency: str = "USD"
    address: Optional[str] = None
    phone_or_contact: Optional[str] = None
    special_requests: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    add_to_itinerary: bool = False
    itinerary_day_id: Optional[str] = None

class BookingOut(BaseModel):
    id: str
    trip_id: str
    user_id: str
    booking_type: str
    title: str
    confirmation_code: str
    status: str
    start_date: datetime
    end_date: Optional[datetime] = None
    time_slot: Optional[str] = None
    party_size: int
    total_price: Optional[float] = None
    currency: str
    address: Optional[str] = None
    phone_or_contact: Optional[str] = None
    special_requests: Optional[str] = None
    details: Optional[Dict[str, Any]] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class RoomTypeOption(BaseModel):
    name: str
    price_per_night: float
    description: str
    capacity: int

class HotelCatalogItem(BaseModel):
    id: str
    name: str
    destination: str
    tier: str
    rating: float
    reviews_count: int
    price_per_night: float
    currency: str
    address: str
    neighborhood: str
    amenities: List[str]
    room_types: List[RoomTypeOption]
    image_url: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class NearbyHotelResult(BaseModel):
    """A hotel catalog item enriched with proximity data relative to the user's tourist spots."""
    hotel: HotelCatalogItem
    distance_km: float = Field(..., description="Distance in km from the nearest tourist spot")
    nearest_spot: str = Field(..., description="Name of the closest itinerary item / tourist spot")

class NearbyRestaurantResult(BaseModel):
    """A dining/restaurant item enriched with proximity data relative to the user's tourist spots."""
    restaurant: RestaurantCatalogItem
    distance_km: float = Field(..., description="Distance in km from the nearest tourist spot")
    nearest_spot: str = Field(..., description="Name of the closest itinerary item / tourist spot")

class RestaurantCatalogItem(BaseModel):
    id: str
    name: str
    destination: str
    cuisine: str
    price_tier: str
    rating: float
    reviews_count: int
    address: str
    neighborhood: str
    vibe: str
    signature_dishes: List[str]
    dietary_options: List[str]
    available_times: List[str]
    image_url: str
    description: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None

from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class RecommendationBase(BaseModel):
    name: str
    category: str
    description: Optional[str] = None
    rating: float = 4.5
    price_level: str = "$$"
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    reason: Optional[str] = None
    tags: List[str] = []
    is_saved: bool = False

class RecommendationCreate(RecommendationBase):
    trip_id: str

class RecommendationOut(RecommendationBase):
    id: str
    trip_id: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class SaveToItineraryRequest(BaseModel):
    recommendation_id: str
    day_id: str
    start_time: Optional[str] = "10:00"
    end_time: Optional[str] = "12:00"
    estimated_cost: Optional[float] = 0.0

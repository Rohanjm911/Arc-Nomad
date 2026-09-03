from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

class AIItineraryRequest(BaseModel):
    trip_id: str
    destination: str
    days_count: int = Field(default=3, ge=1, le=14)
    travel_style: Optional[str] = "Balanced"  # Adventure, Cultural, Luxury, Budget, Relaxed, Fast-Paced
    interests: List[str] = []
    budget_tier: Optional[str] = "Moderate"
    pace: Optional[str] = "Moderate"  # Relaxed, Moderate, Packed
    custom_notes: Optional[str] = None

class AIRecommendationRequest(BaseModel):
    trip_id: str
    destination: str
    category: Optional[str] = "All"  # Attractions, Restaurants, Activities, Cafes, Hotels, Hidden Gems
    interests: List[str] = []
    travel_style: Optional[str] = "Balanced"
    limit: int = 6

class AIModifyItineraryRequest(BaseModel):
    trip_id: str
    day_number: Optional[int] = None
    instruction: str  # e.g., "Replace dinner with an authentic ramen spot and add a late night viewpoint"
    budget_constraint: Optional[Decimal] = None
    weather_condition: Optional[str] = None

class GeneratedItineraryItem(BaseModel):
    title: str
    description: str
    location_name: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    start_time: str
    end_time: str
    category: str
    estimated_cost: float = 0.0
    notes: Optional[str] = None

class GeneratedDayPlan(BaseModel):
    day_number: int
    theme: str
    notes: Optional[str] = None
    items: List[GeneratedItineraryItem]

class GeneratedItineraryResponse(BaseModel):
    destination: str
    summary: str
    total_estimated_cost: float
    days: List[GeneratedDayPlan]
    travel_tips: List[str] = []

class GeneratedRecommendationItem(BaseModel):
    name: str
    category: str
    description: str
    rating: float
    price_level: str
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    reason: str
    tags: List[str] = []

class GeneratedRecommendationsResponse(BaseModel):
    destination: str
    recommendations: List[GeneratedRecommendationItem]

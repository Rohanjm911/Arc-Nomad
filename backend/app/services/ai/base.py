from abc import ABC, abstractmethod
from typing import List, Optional
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse,
    AIRecommendationRequest, GeneratedRecommendationsResponse,
    AIModifyItineraryRequest
)

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_itinerary(self, req: AIItineraryRequest) -> GeneratedItineraryResponse:
        pass

    @abstractmethod
    async def generate_recommendations(self, req: AIRecommendationRequest) -> GeneratedRecommendationsResponse:
        pass

    @abstractmethod
    async def modify_itinerary(self, req: AIModifyItineraryRequest, current_itinerary_json: dict) -> GeneratedItineraryResponse:
        pass

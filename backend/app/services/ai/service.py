import os
import logging
from typing import Optional
from backend.app.core.config import settings
from backend.app.services.ai.base import BaseAIProvider
from backend.app.services.ai.openrouter_provider import OpenRouterAIProvider
from backend.app.services.ai.gemini_provider import GeminiAIProvider
from backend.app.services.ai.mock_provider import MockAIProvider
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse,
    AIRecommendationRequest, GeneratedRecommendationsResponse,
    AIModifyItineraryRequest
)

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.fallback_provider = MockAIProvider()

    def get_provider(self) -> BaseAIProvider:
        pref = (settings.AI_PROVIDER or os.getenv("AI_PROVIDER", "auto")).lower().strip()
        openrouter_key = settings.OPENROUTER_API_KEY or os.getenv("OPENROUTER_API_KEY")
        gemini_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")

        # 1. Check OpenRouter
        if pref == "openrouter" or (pref == "auto" and openrouter_key and len(openrouter_key.strip()) > 5):
            if openrouter_key and len(openrouter_key.strip()) > 5:
                try:
                    return OpenRouterAIProvider(api_key=openrouter_key.strip(), model_name=settings.OPENROUTER_MODEL)
                except Exception as e:
                    logger.warning(f"Failed to instantiate OpenRouterAIProvider: {e}")

        # 2. Check Gemini
        if pref == "gemini" or (pref == "auto" and gemini_key and len(gemini_key.strip()) > 5):
            if gemini_key and len(gemini_key.strip()) > 5:
                try:
                    return GeminiAIProvider(api_key=gemini_key.strip(), model_name=settings.GEMINI_MODEL)
                except Exception as e:
                    logger.warning(f"Failed to instantiate GeminiAIProvider: {e}")

        return self.fallback_provider

    async def generate_itinerary(self, req: AIItineraryRequest) -> GeneratedItineraryResponse:
        provider = self.get_provider()
        if not isinstance(provider, MockAIProvider):
            try:
                logger.info(f"Generating itinerary with {provider.__class__.__name__} for {req.destination}")
                return await provider.generate_itinerary(req)
            except Exception as e:
                logger.error(f"{provider.__class__.__name__} failed: {e}. Falling back to smart travel architect.")
                return await self.fallback_provider.generate_itinerary(req)
        return await self.fallback_provider.generate_itinerary(req)

    async def generate_recommendations(self, req: AIRecommendationRequest) -> GeneratedRecommendationsResponse:
        provider = self.get_provider()
        if not isinstance(provider, MockAIProvider):
            try:
                logger.info(f"Generating recommendations with {provider.__class__.__name__} for {req.destination}")
                return await provider.generate_recommendations(req)
            except Exception as e:
                logger.error(f"{provider.__class__.__name__} failed: {e}. Falling back to smart travel curator.")
                return await self.fallback_provider.generate_recommendations(req)
        return await self.fallback_provider.generate_recommendations(req)

    async def modify_itinerary(self, req: AIModifyItineraryRequest, current_itinerary_json: dict) -> GeneratedItineraryResponse:
        provider = self.get_provider()
        if not isinstance(provider, MockAIProvider):
            try:
                return await provider.modify_itinerary(req, current_itinerary_json)
            except Exception as e:
                logger.error(f"{provider.__class__.__name__} modify failed: {e}. Falling back to smart travel architect.")
                return await self.fallback_provider.modify_itinerary(req, current_itinerary_json)
        return await self.fallback_provider.modify_itinerary(req, current_itinerary_json)

ai_service = AIService()


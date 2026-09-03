import json
from typing import Dict, Any
from google import genai
from google.genai import types
from backend.app.core.config import settings
from backend.app.services.ai.base import BaseAIProvider
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse,
    AIRecommendationRequest, GeneratedRecommendationsResponse,
    AIModifyItineraryRequest
)

import logging

logger = logging.getLogger(__name__)

class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: str, model_name: str = "gemini-3.7-flash"):
        self.client = genai.Client(api_key=api_key)
        self.model_name = model_name or "gemini-3.7-flash"

    def _clean_json_text(self, text: str) -> str:
        s = text.strip()
        if s.startswith("```"):
            lines = s.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            s = "\n".join(lines).strip()
        return s

    def _generate_content_with_fallback(self, prompt: str) -> dict:
        models_to_try = [self.model_name]
        for fallback in ["gemini-2.5-flash", "gemini-2.0-flash"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        last_error = None
        for model in models_to_try:
            try:
                response = self.client.models.generate_content(
                    model=model,
                    contents=prompt,
                    config=types.GenerateContentConfig(
                        response_mime_type="application/json"
                    )
                )
                cleaned = self._clean_json_text(response.text)
                return json.loads(cleaned)
            except Exception as e:
                logger.warning(f"Gemini model {model} attempt failed: {e}")
                last_error = e

        raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")

    async def generate_itinerary(self, req: AIItineraryRequest) -> GeneratedItineraryResponse:
        prompt = f"""
You are ARC-NOMADE's elite AI Travel Architect. Generate a realistic, structured, day-by-day travel itinerary.

Destination: {req.destination}
Duration: {req.days_count} days
Travel Style: {req.travel_style}
Interests: {", ".join(req.interests) if req.interests else "General highlights, culture, dining"}
Budget Tier: {req.budget_tier}
Pace: {req.pace}
Additional Instructions: {req.custom_notes or "None"}

Please produce a complete itinerary formatted strictly as JSON with this schema:
{{
  "destination": "{req.destination}",
  "summary": "High level overview of the trip experience",
  "total_estimated_cost": 150.0,
  "days": [
    {{
      "day_number": 1,
      "theme": "Day theme or focus",
      "notes": "Helpful day context",
      "items": [
        {{
          "title": "Item name",
          "description": "Engaging description",
          "location_name": "Location or neighborhood",
          "address": "Approximate address or district",
          "latitude": 35.6762,
          "longitude": 139.6503,
          "start_time": "09:00",
          "end_time": "11:00",
          "category": "SIGHTSEEING",
          "estimated_cost": 25.0,
          "notes": "Pro tip"
        }}
      ]
    }}
  ],
  "travel_tips": ["Tip 1", "Tip 2", "Tip 3"]
}}

Ensure realistic latitude and longitude coordinates for the destination, sensible chronological times (HH:MM), and category from: SIGHTSEEING, FOOD, ACTIVITY, TRANSPORT, HOTEL, RELAXATION, OTHER.
Return ONLY valid JSON.
"""
        try:
            raw_json = self._generate_content_with_fallback(prompt)
            return GeneratedItineraryResponse(**raw_json)
        except Exception as e:
            raise RuntimeError(f"Gemini API error during itinerary generation: {str(e)}")

    async def generate_recommendations(self, req: AIRecommendationRequest) -> GeneratedRecommendationsResponse:
        prompt = f"""
You are ARC-NOMADE's AI Travel Curator. Suggest {req.limit} handpicked recommendations for {req.destination}.
Category Filter: {req.category}
Interests: {", ".join(req.interests) if req.interests else "General"}
Travel Style: {req.travel_style}

Format strictly as JSON:
{{
  "destination": "{req.destination}",
  "recommendations": [
    {{
      "name": "Spot name",
      "category": "Attractions",
      "description": "Engaging 2-sentence description",
      "rating": 4.8,
      "price_level": "$$",
      "address": "Address or neighborhood",
      "latitude": 35.6762,
      "longitude": 139.6503,
      "image_url": null,
      "reason": "Why this matches traveler profile",
      "tags": ["Tag1", "Tag2"]
    }}
  ]
}}
Category must be one of: Attractions, Restaurants, Activities, Cafes, Hotels, Hidden Gems.
Return ONLY valid JSON.
"""
        try:
            raw_json = self._generate_content_with_fallback(prompt)
            return GeneratedRecommendationsResponse(**raw_json)
        except Exception as e:
            raise RuntimeError(f"Gemini API error during recommendation generation: {str(e)}")

    async def modify_itinerary(self, req: AIModifyItineraryRequest, current_itinerary_json: dict) -> GeneratedItineraryResponse:
        prompt = f"""
You are ARC-NOMADE's AI Travel Architect. Modify the existing itinerary according to the user's instructions.

Current Itinerary:
{json.dumps(current_itinerary_json, indent=2)}

User Instruction: {req.instruction}
Day to modify: {req.day_number if req.day_number else "Whole trip"}
Budget Constraint: {req.budget_constraint or 'None'}
Weather condition to adapt to: {req.weather_condition or 'None'}

Return the modified full itinerary formatted as valid JSON matching the same schema.
"""
        try:
            raw_json = self._generate_content_with_fallback(prompt)
            return GeneratedItineraryResponse(**raw_json)
        except Exception as e:
            raise RuntimeError(f"Gemini API error during itinerary modification: {str(e)}")


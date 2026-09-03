import json
import logging
import httpx
from typing import Dict, Any, List
from backend.app.services.ai.base import BaseAIProvider
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse,
    AIRecommendationRequest, GeneratedRecommendationsResponse,
    AIModifyItineraryRequest
)

logger = logging.getLogger(__name__)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

class OpenRouterAIProvider(BaseAIProvider):
    def __init__(self, api_key: str, model_name: str = "google/gemini-2.5-flash"):
        self.api_key = api_key.strip()
        self.model_name = model_name.strip() if model_name else "google/gemini-2.5-flash"

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

    async def _call_openrouter(self, prompt: str, system_prompt: str = "You are ARC-NOMADE's elite AI Travel Architect. Respond strictly with valid JSON matching the requested schema.") -> dict:
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://arc-nomade.travel",
            "X-Title": "ARC-NOMADE Travel Architect",
        }

        # Fallback candidates if primary model is unavailable or rate-limited
        models_to_try = [self.model_name]
        for fallback in ["google/gemini-2.5-flash", "openai/gpt-4o-mini", "deepseek/deepseek-chat"]:
            if fallback not in models_to_try:
                models_to_try.append(fallback)

        last_error = None
        async with httpx.AsyncClient(timeout=50.0) as client:
            for model in models_to_try:
                payload = {
                    "model": model,
                    "messages": [
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": prompt}
                    ],
                    "response_format": {"type": "json_object"},
                    "max_tokens": 4500
                }

                try:
                    logger.info(f"Dispatching OpenRouter request using model: {model}")
                    response = await client.post(OPENROUTER_API_URL, headers=headers, json=payload)
                    
                    if response.status_code == 200:
                        data = response.json()
                        choices = data.get("choices", [])
                        if choices and "message" in choices[0]:
                            content = choices[0]["message"].get("content", "")
                            cleaned = self._clean_json_text(content)
                            return json.loads(cleaned)
                    else:
                        error_detail = response.text
                        logger.warning(f"OpenRouter model {model} returned status {response.status_code}: {error_detail}")
                        last_error = f"Status {response.status_code}: {error_detail}"
                except Exception as e:
                    logger.warning(f"OpenRouter request error with model {model}: {e}")
                    last_error = e

        raise RuntimeError(f"All OpenRouter models failed. Last error: {last_error}")

    async def generate_itinerary(self, req: AIItineraryRequest) -> GeneratedItineraryResponse:
        prompt = f"""
Generate a realistic, structured, day-by-day travel itinerary.

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
        raw_json = await self._call_openrouter(prompt)
        return GeneratedItineraryResponse(**raw_json)

    async def generate_recommendations(self, req: AIRecommendationRequest) -> GeneratedRecommendationsResponse:
        prompt = f"""
Suggest {req.limit} handpicked recommendations for {req.destination}.
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
        raw_json = await self._call_openrouter(prompt)
        return GeneratedRecommendationsResponse(**raw_json)

    async def modify_itinerary(self, req: AIModifyItineraryRequest, current_itinerary_json: dict) -> GeneratedItineraryResponse:
        prompt = f"""
Modify the existing itinerary according to the user's instructions.

Current Itinerary:
{json.dumps(current_itinerary_json, indent=2)}

User Instruction: {req.instruction}
Day to modify: {req.day_number if req.day_number else "Whole trip"}
Budget Constraint: {req.budget_constraint or 'None'}
Weather condition to adapt to: {req.weather_condition or 'None'}

Return the modified full itinerary formatted as valid JSON matching the same schema.
"""
        raw_json = await self._call_openrouter(prompt)
        return GeneratedItineraryResponse(**raw_json)

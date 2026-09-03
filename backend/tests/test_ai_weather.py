import pytest
from backend.app.schemas.ai import AIItineraryRequest, AIRecommendationRequest
from backend.app.services.ai.service import ai_service
from backend.app.services.weather.service import weather_service

@pytest.mark.asyncio
async def test_ai_itinerary_generation():
    req = AIItineraryRequest(
        trip_id="test-trip-1",
        destination="Tokyo, Japan",
        days_count=3,
        travel_style="Balanced",
        interests=["Culinary", "Art"]
    )
    result = await ai_service.generate_itinerary(req)
    assert result.destination == "Tokyo, Japan"
    assert len(result.days) == 3
    assert len(result.days[0].items) >= 2

@pytest.mark.asyncio
async def test_ai_recommendations_generation():
    req = AIRecommendationRequest(
        trip_id="test-trip-1",
        destination="Rome, Italy",
        limit=4
    )
    result = await ai_service.generate_recommendations(req)
    assert result.destination == "Rome, Italy"
    assert len(result.recommendations) >= 3

@pytest.mark.asyncio
async def test_weather_service_fallback():
    weather = await weather_service.get_weather(lat=35.6762, lng=139.6503, destination_name="Tokyo")
    assert "temperature" in weather
    assert "condition" in weather
    assert "forecast" in weather
    assert len(weather["forecast"]) >= 3

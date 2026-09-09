import json
import random
from typing import Dict, Any, List
from backend.app.services.ai.base import BaseAIProvider
from backend.app.schemas.ai import (
    AIItineraryRequest, GeneratedItineraryResponse, GeneratedDayPlan, GeneratedItineraryItem,
    AIRecommendationRequest, GeneratedRecommendationsResponse, GeneratedRecommendationItem,
    AIModifyItineraryRequest
)

from backend.app.services.geocoding.service import geocoding_service

def get_coords_for_destination(dest: str) -> tuple[float, float]:
    return geocoding_service.get_destination_coords_sync(dest)

class MockAIProvider(BaseAIProvider):
    """
    High-fidelity mock AI travel assistant when Gemini API key is not configured or in offline test mode.
    """
    async def generate_itinerary(self, req: AIItineraryRequest) -> GeneratedItineraryResponse:
        dest = req.destination
        base_lat, base_lng = get_coords_for_destination(dest)
        days: List[GeneratedDayPlan] = []
        
        themes = [
            f"Iconic Landmarks & Cultural Discovery in {dest}",
            f"Epicurean Delights & Hidden Neighborhoods in {dest}",
            f"Scenic Viewpoints & Atmospheric Nightlife in {dest}",
            f"Artisan Markets & Historic Heritage of {dest}",
            f"Coastal / Nature Escapes & Sunset Panoramic Vistas in {dest}",
            f"Modern Pulse & Contemporary Arts in {dest}",
            f"Relaxation, Wellness & Farewell Feast in {dest}"
        ]
        
        item_templates = [
            ("Morning Artisan Breakfast & Specialty Coffee", "08:30", "09:45", "FOOD", 18.0, "Start your day with locally roasted coffee and signature regional pastries."),
            ("Historic District Walking Exploration & Landmark Highlights", "10:15", "12:30", "SIGHTSEEING", 25.0, "Explore iconic architecture, cobbled alleys, and guided historical monuments."),
            ("Traditional Local Lunch & Flavor Tasting", "13:00", "14:15", "FOOD", 35.0, "Savor authentic regional dishes recommended by local culinary masters."),
            ("Curated Cultural Exhibition / Scenic Nature Adventure", "14:45", "17:00", "ACTIVITY", 40.0, "Immerse yourself in world-class exhibits or breath-taking outdoor vistas."),
            ("Golden Hour Sunset Stroll & Panoramic Viewpoint", "17:30", "18:45", "SIGHTSEEING", 0.0, "Watch the magic hour transform the skyline from the highest vantage point."),
            ("Signature Dinner & Cocktail Lounge Experience", "19:30", "22:00", "FOOD", 65.0, "Unwind with bespoke cocktails and a multi-course dinner celebrating local gastronomy.")
        ]
        
        total_cost = 0.0
        for d in range(1, req.days_count + 1):
            theme = themes[(d - 1) % len(themes)]
            day_items: List[GeneratedItineraryItem] = []
            
            # Add 4 to 5 items per day
            selected_templates = item_templates[:4] if req.pace == "Relaxed" else item_templates
            for i, (title, start, end, cat, cost, desc) in enumerate(selected_templates):
                offset_lat = (random.random() - 0.5) * 0.03
                offset_lng = (random.random() - 0.5) * 0.03
                item_cost = cost if req.budget_tier != "Budget" else round(cost * 0.6, 2)
                if req.budget_tier == "Luxury":
                    item_cost = round(item_cost * 2.2, 2)
                total_cost += item_cost
                
                day_items.append(
                    GeneratedItineraryItem(
                        title=f"{title} ({dest})",
                        description=f"{desc} Tailored for {req.travel_style or 'balanced'} exploration.",
                        location_name=f"District {i+1}, {dest}",
                        address=f"{100 + (d * 10) + i} Traveler Avenue, {dest}",
                        latitude=round(base_lat + offset_lat, 5),
                        longitude=round(base_lng + offset_lng, 5),
                        start_time=start,
                        end_time=end,
                        category=cat,
                        estimated_cost=item_cost,
                        notes=f"Day {d} item #{i+1}. Wear comfortable footwear."
                    )
                )
            
            days.append(
                GeneratedDayPlan(
                    day_number=d,
                    theme=theme,
                    notes=f"Day {d} schedule optimized for smooth transit and memorable experiences in {dest}.",
                    items=day_items
                )
            )

        return GeneratedItineraryResponse(
            destination=dest,
            summary=f"A meticulously crafted {req.days_count}-day itinerary for {dest}, balancing iconic highlights, culinary marvels, and authentic local vibes for {req.travel_style or 'all'} travelers.",
            total_estimated_cost=round(total_cost, 2),
            days=days,
            travel_tips=[
                f"Get a local rechargeable transit card upon arrival in {dest}.",
                "Book reservations for popular evening venues 24 hours in advance.",
                "Keep local currency handy for street markets and artisanal cafes.",
                "Check daily sunrise/sunset times for the best photography lighting."
            ]
        )

    async def generate_recommendations(self, req: AIRecommendationRequest) -> GeneratedRecommendationsResponse:
        dest = req.destination
        base_lat, base_lng = get_coords_for_destination(dest)
        
        sample_recs = [
            ("Grand Panoramic Sky Observatory", "Attractions", 4.9, "$$$", "Breathtaking 360-degree views over the entire metropolis with glass-floor viewing decks.", "Recommended for spectacular cityscapes and photography."),
            ("The Old Quarter Heritage Eatery", "Restaurants", 4.8, "$$", "Renowned local dining spot serving century-old secret recipes and fresh daily market ingredients.", "Recommended for authentic regional flavors and cozy ambiance."),
            ("Artisan Coffee Roasters & Tea House", "Cafes", 4.7, "$", "Specialty single-origin pour-overs, handmade matcha pastries, and relaxing courtyard seating.", "Recommended for a peaceful mid-day coffee break."),
            ("Secret Rooftop Speakeasy Lounge", "Nightlife", 4.9, "$$$", "Hidden cocktail bar concealed behind a vintage telephone booth with bespoke mixology.", "Recommended because of your interest in nightlife and unique atmospheric spots."),
            ("Guided Bicycle & Waterfront Eco-Tour", "Activities", 4.8, "$$", "Scenic 2-hour coastal ride through vibrant avenues, sculpture parks, and harbor boardwalks.", "Recommended for outdoor lovers and active exploration."),
            ("Historic Museum of Art & Modern Wonder", "Attractions", 4.9, "$$", "Comprehensive museum featuring both ancient artifacts and cutting-edge interactive digital art.", "Recommended for immersive cultural insights."),
            ("Boutique Heritage Villa & Spa", "Hotels", 4.9, "$$$$", "Luxurious historic lodging featuring thermal spring baths, terrace gardens, and world-class concierge.", "Recommended for premium rest and rejuvenation."),
            ("Lantern-Lit Alley Artisan Bazaar", "Hidden Gems", 4.8, "$", "Hidden labyrinth of independent potters, leather crafters, and street food stalls after dark.", "Recommended because you enjoy hidden gems and local craftsmanship."),
            ("Sunken Courtyard Vinyl Listening Bar", "Hidden Gems", 4.9, "$$", "Intimate acoustic enclave featuring vintage vacuum tube amplifiers and rare Japanese pressings.", "Curated discovery for quiet evenings and music aficionados."),
            ("Ancient Moss Garden Shinto Sanctuary", "Hidden Gems", 4.8, "Free", "Serene secluded stone shrine shrouded in centuries-old cedar trees and bamboo pathways.", "Secret tranquil oasis completely off the main tourist trail."),
            ("Underground Botanical Cellar & Herbal Tea Library", "Cafes", 4.9, "$$", "Subterranean stone vault serving customized botanical infusions and farm honey.", "Exclusive artisan experience with tranquil plant-draped stone booths."),
            ("Neon-Lit Retro Arcade & Speakeasy Bar", "Nightlife", 4.7, "$$", "1980s retro Japanese arcade games combined with curated highball cocktails.", "High-energy hidden night experience loved by locals.")
        ]

        # Prioritize category matching if requested
        if req.category and req.category.strip().lower() not in ("all", ""):
            cat_query = req.category.strip().lower()
            matched = [r for r in sample_recs if cat_query in r[1].lower() or r[1].lower() in cat_query]
            unmatched = [r for r in sample_recs if r not in matched]
            recs_to_use = (matched + unmatched)[:req.limit]
        else:
            recs_to_use = sample_recs[:req.limit]

        # Factor in custom vibe interests
        interest_vibe = ", ".join(req.interests) if req.interests else req.travel_style

        items: List[GeneratedRecommendationItem] = []
        for name, cat, rating, price, desc, reason in recs_to_use:
            offset_lat = (random.random() - 0.5) * 0.04
            offset_lng = (random.random() - 0.5) * 0.04
            custom_reason = f"Curated for your '{interest_vibe}' focus. {reason}" if interest_vibe else reason
            items.append(
                GeneratedRecommendationItem(
                    name=f"{name} — {dest}",
                    category=cat,
                    description=desc,
                    rating=rating,
                    price_level=price,
                    address=f"{random.randint(10, 250)} Heritage Way, {dest}",
                    latitude=round(base_lat + offset_lat, 5),
                    longitude=round(base_lng + offset_lng, 5),
                    image_url=None,
                    reason=custom_reason,
                    tags=["Popular", "Must-Visit", cat]
                )
            )
            
        return GeneratedRecommendationsResponse(
            destination=dest,
            recommendations=items
        )

    async def modify_itinerary(self, req: AIModifyItineraryRequest, current_itinerary_json: dict) -> GeneratedItineraryResponse:
        # Simple intelligent adaptation: simulate modification based on instruction
        dest = current_itinerary_json.get("destination", "Destination")
        return await self.generate_itinerary(AIItineraryRequest(
            trip_id=req.trip_id,
            destination=dest,
            days_count=3,
            custom_notes=req.instruction
        ))

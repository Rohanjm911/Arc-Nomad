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
        
        dest_lower = dest.lower()
        
        # Comprehensive destination-specific recommendation catalogs
        catalog_by_destination = {
            "rome": [
                ("The Colosseum Arena & Hypogeum", "Attractions", 4.9, "$$$", "Walk in the footsteps of ancient gladiators across the reconstructed wooden arena floor.", "Essential historical landmark for exploring ancient Roman architectural mastery."),
                ("Trastevere Da Enzo al 29", "Restaurants", 4.8, "$$", "Beloved Roman trattoria renowned for artisanal carbonara, fried artichokes, and tiramisu.", "Recommended for authentic regional Roman cuisine and vibrant cobblestone atmosphere."),
                ("Sant'Eustachio Il Caffè", "Cafes", 4.7, "$", "Historic espresso roaster dating to the 1930s famous for creamy granita and signature wood-roasted blends.", "Iconic Italian coffee landmark steps away from the Pantheon."),
                ("Jerry Thomas Speakeasy Project", "Nightlife", 4.9, "$$$", "Italy's first secret prohibition-style cocktail club hidden behind an unassuming wooden door.", "Recommended for connoisseurs of craft cocktails, vintage bitters, and speakeasy ambiance."),
                ("Villa Borghese Gardens & Rowboats", "Activities", 4.8, "$", "Serene Mediterranean pine park featuring rowboat rentals on the temple pond and panoramic Pincio terrace.", "Refreshing outdoor respite with panoramic vistas over Piazza del Popolo."),
                ("Galleria Doria Pamphilj Palace", "Attractions", 4.9, "$$", "Privately owned Renaissance palace housing masterpieces by Caravaggio and Velázquez.", "Spectacular gilded state rooms without the overwhelming crowds of larger museums."),
                ("Hotel de Russie Secret Garden", "Hotels", 4.9, "$$$$", "Legendary luxury hotel nestled between the Spanish Steps and Piazza del Popolo with terraced gardens.", "Curated luxury retreat known for private garden aperitivo and historic grandeur."),
                ("Keyhole of the Knights of Malta", "Hidden Gems", 4.8, "Free", "Secret peephole on the Aventine Hill framing an astonishing miniature view of St. Peter's Dome through pruned hedges.", "Magical hidden perspective cherished by discerning travelers."),
                ("Salotto 42 Literary & Aperitivo Bar", "Nightlife", 4.7, "$$", "Sophisticated cocktail lounge set directly against the 2nd-century marble pillars of Hadrian's Temple.", "Unmatched nighttime aesthetic blending imperial Roman ruins with contemporary lounge vibe."),
                ("Roscioli Bakery & Ancient Salumeria", "Restaurants", 4.9, "$$", "Rome's premier gastro-hub offering cured culatello, burrata, and oven-fresh Roman focaccia.", "Gourmet pilgrimage spot for cheese, wine, and handcrafted pasta."),
                ("Chiostro del Bramante Caffe", "Cafes", 4.8, "$$", "Peaceful cafe inside a 15th-century Renaissance cloister hosting modern art retrospectives.", "Tranquil intellectual sanctuary hidden in the heart of Rome's historic center."),
                ("Appian Way Ancient Roman Bike Trail", "Activities", 4.8, "$$", "Pedal along intact 2,000-year-old basalt Roman roads past cypress trees and imperial catacombs.", "Extraordinary open-air archaeological journey through Italy's picturesque countryside.")
            ],
            "tokyo": [
                ("Shibuya Sky 360 Observatory", "Attractions", 4.9, "$$$", "Open-air rooftop observatory towering 229 meters directly above the bustling Shibuya Scramble.", "Recommended for breathtaking panoramic views of Tokyo Tower and Mount Fuji."),
                ("Gonpachi Nishi-Azabu Tavern", "Restaurants", 4.8, "$$", "Multi-tiered Edo-style tavern with open charcoal grills that inspired Quentin Tarantino's Kill Bill.", "Renowned for charcoal yakitori skewers, handmade buckwheat soba, and energetic izakaya vibes."),
                ("Fuglen Tokyo Vintage Nordic Cafe", "Cafes", 4.7, "$", "Specialty Scandinavian light-roast coffee bar transformed into an intimate craft cocktail lounge by night.", "Cozy mid-century aesthetic located steps away from Yoyogi Park."),
                ("Bar Trench Craft Herbal Speakeasy", "Nightlife", 4.9, "$$$", "Asia's 50 Best bar serving artisanal herbal absinthe cocktails in an intimate lantern-lit hideaway.", "Ideal for travelers seeking world-class mixology and vintage bohemian atmosphere."),
                ("TeamLab Borderless Digital Art Museum", "Attractions", 4.9, "$$", "Immersive interactive digital light museum where artworks move between rooms without boundaries.", "Cutting-edge sensory journey blending technology, light, and nature."),
                ("Yanaka Ginza Nostalgic Old Town Walk", "Hidden Gems", 4.8, "Free", "Charming Edo-period neighborhood that survived WW2 intact, brimming with artisan cat-themed street stalls.", "Off-the-beaten-path cultural enclave showcasing tranquil traditional Tokyo life."),
                ("Hoshinoya Tokyo Ryokan", "Hotels", 4.9, "$$$$", "High-rise luxury ryokan in Otemachi featuring top-floor natural hot spring onsen drawn from 1,500m underground.", "Supreme blend of classical Japanese hospitality with modern architectural elegance."),
                ("Nonbei Yokocho (Drunkard's Alley)", "Nightlife", 4.7, "$$", "Atmospheric postwar micro-alley lined with tiny 5-seat yakitori bars glowing with red paper lanterns.", "Authentic nostalgic evening destination right beside Shibuya Station."),
                ("Kosoan Traditional Green Tea Teahouse", "Cafes", 4.8, "$$", "Hidden Taisho-era wooden residence serving matcha and seasonal wagashi overlooking an authentic moss rock garden.", "Peaceful traditional sanctuary tucked into the trendy Jiyugaoka neighborhood."),
                ("Meguro River Coastal Cherry Promenade", "Activities", 4.8, "Free", "Scenic riverside walking trail illuminated with pink lanterns, trendy boutiques, and artisan bakeries.", "Spectacular photography and leisurely strolls along the scenic canal."),
                ("Bar Martha Vinyl Listening Parlor", "Hidden Gems", 4.8, "$$", "Ultra-discreet acoustic lounge featuring McIntosh amplifiers, thousands of rare vinyl records, and hand-cut ice.", "Acoustic wonderland for music lovers and craft whisky enthusiasts."),
                ("Tsukiji Outer Market Food Safari", "Restaurants", 4.8, "$$", "Bustling marketplace stalls serving freshly torched wagyu beef, tamagoyaki omelet sticks, and bluefin tuna nigiri.", "Must-visit morning gastronomic adventure for sushi and seafood lovers.")
            ],
            "paris": [
                ("Musée de l'Orangerie Water Lilies", "Attractions", 4.9, "$$", "Curved oval gallery rooms purpose-built to display Monet's monumental panoramic Water Lilies murals.", "Unrivaled impressionist masterpiece experience overlooking the Tuileries Garden."),
                ("Le Comptoir du Relais Saint-Germain", "Restaurants", 4.8, "$$", "Quintessential Left Bank neo-bistro by Chef Yves Camdeborde serving classic Parisian comfort dishes.", "Authentic gastronomic dining in vibrant Saint-Germain-des-Prés."),
                ("Café de Flore Saint-Germain", "Cafes", 4.7, "$$", "Historic literary rendezvous frequented by Sartre and Hemingway serving velvety hot chocolate.", "Timeless Parisian cafe culture and people-watching terrace."),
                ("Le Syndicat Secret Speakeasy", "Nightlife", 4.9, "$$$", "Discreet cocktail bar hidden behind dilapidated concert posters championing all-French spirits.", "Voted among World's 50 Best Bars with cutting-edge mixology and hip-hop beats."),
                ("Canal Saint-Martin Sunset Picnic Walk", "Activities", 4.8, "Free", "Bohemian waterway featuring iron footbridges, vintage boutiques, and waterside wine bars.", "Chic local promenade away from tourist corridors."),
                ("Sainte-Chapelle Stained Glass Jewel", "Attractions", 4.9, "$$", "13th-century Gothic royal chapel featuring 1,113 vibrant stained glass windows reaching to the heavens.", "Mesmerizing optical spectacle when morning sun rays pierce the chapel."),
                ("Hôtel de Crillon Palace Suites", "Hotels", 4.9, "$$$$", "Grand 18th-century royal palace overlooking Place de la Concorde with bespoke Parisian luxury.", "Peak French decorative craftsmanship and Rosewood hospitality."),
                ("Passage des Panoramas Covered Arcade", "Hidden Gems", 4.8, "$", "Paris's oldest glass-roofed shopping arcade built in 1799, packed with stamp dealers and wine bars.", "Atmospheric journey into 19th-century Parisian history."),
                ("Moonshiner Pizzeria Speakeasy", "Nightlife", 4.7, "$$", "Secret speakeasy concealed behind the walk-in meat locker of Pizzeria Da Vito with jazz vinyls.", "Intimate 1920s Prohibition ambiance in Bastille."),
                ("Du Pain et des Idées Bakery", "Cafes", 4.8, "$", "Award-winning heritage boulangerie from 1875 famous for snail-shaped pistachio escargot pastries.", "Unmatched artisan bakery scent and Parisian neighborhood warmth."),
                ("Parc des Buttes-Chaumont Temple", "Activities", 4.8, "Free", "Romantic landscaped park with cliffs, suspension bridges, and a cliff-top temple overlooking Montmartre.", "Spectacular natural haven for scenic walks and skyline views."),
                ("Rue des Barres Medieval Cobblestone Alley", "Hidden Gems", 4.9, "Free", "One of Paris's oldest pedestrian alleys lined with half-timbered stone houses behind Saint-Gervais church.", "Tranquil romantic stroll frozen in medieval time.")
            ]
        }

        # Resolve destination matching
        target_list = None
        for k in catalog_by_destination:
            if k in dest_lower:
                target_list = catalog_by_destination[k]
                break

        if not target_list:
            # Universal curated catalog with realistic names
            target_list = [
                ("Panoramic Sky Deck Observatory", "Attractions", 4.9, "$$$", f"Breathtaking 360-degree views over the entire {dest} skyline with glass-floor viewing decks.", "Recommended for spectacular cityscapes and photography."),
                ("Old Town Heritage Osteria", "Restaurants", 4.8, "$$", f"Renowned local dining spot in {dest} serving century-old secret recipes and fresh daily market ingredients.", "Recommended for authentic regional flavors and cozy ambiance."),
                ("Artisan Roast House & Botanicals", "Cafes", 4.7, "$", f"Specialty single-origin pour-overs, handmade pastries, and relaxing courtyard seating in {dest}.", "Recommended for a peaceful mid-day coffee break."),
                ("Vintage Cellar Speakeasy Lounge", "Nightlife", 4.9, "$$$", f"Hidden cocktail bar concealed behind a vintage telephone booth with bespoke mixology in {dest}.", "Recommended for nightlife and unique atmospheric spots."),
                ("Scenic Coastal & Waterfront Bicycle Trail", "Activities", 4.8, "$$", f"Scenic 2-hour ride through vibrant avenues, sculpture parks, and harbor boardwalks in {dest}.", "Recommended for outdoor lovers and active exploration."),
                ("Fine Arts & Ancient Civilization Museum", "Attractions", 4.9, "$$", f"Comprehensive museum in {dest} featuring ancient artifacts and modern interactive exhibitions.", "Recommended for immersive cultural insights."),
                ("Heritage Boutique Villa & Thermal Spa", "Hotels", 4.9, "$$$$", f"Luxurious historic lodging featuring thermal mineral baths and terrace gardens in {dest}.", "Recommended for premium rest and rejuvenation."),
                ("Artisan Courtyard Flea Market", "Hidden Gems", 4.8, "$", f"Hidden labyrinth of independent potters, leather crafters, and local street stalls in {dest}.", "Recommended for local craftsmanship and unique souvenirs."),
                ("Acoustic Vinyl Listening Lounge", "Hidden Gems", 4.9, "$$", f"Intimate acoustic enclave featuring vintage vacuum tube amplifiers and rare pressings in {dest}.", "Curated discovery for quiet evenings and music aficionados."),
                ("Secret Cloister Sanctuary & Garden", "Hidden Gems", 4.8, "Free", f"Serene secluded stone garden shrouded in centuries-old trees and peaceful stone walkways in {dest}.", "Secret tranquil oasis completely off the main tourist trail."),
                ("Subterranean Herbal Tea Library", "Cafes", 4.9, "$$", f"Subterranean stone vault serving customized botanical infusions and farm honey in {dest}.", "Exclusive artisan experience with tranquil plant-draped booths."),
                ("Retro Arcade Highball Bar", "Nightlife", 4.7, "$$", f"Vintage 1980s games combined with curated highball cocktails and local draft beers in {dest}.", "High-energy hidden night experience loved by locals.")
            ]

        # Prioritize category matching if requested
        if req.category and req.category.strip().lower() not in ("all", ""):
            cat_query = req.category.strip().lower()
            matched = [r for r in target_list if cat_query in r[1].lower() or r[1].lower() in cat_query]
            unmatched = [r for r in target_list if r not in matched]
            recs_to_use = (matched + unmatched)[:req.limit]
        else:
            recs_to_use = target_list[:req.limit]

        # Factor in custom vibe interests
        interest_vibe = ", ".join(req.interests) if req.interests else req.travel_style

        items: List[GeneratedRecommendationItem] = []
        for name, cat, rating, price, desc, reason in recs_to_use:
            offset_lat = (random.random() - 0.5) * 0.04
            offset_lng = (random.random() - 0.5) * 0.04
            custom_reason = f"Curated for your '{interest_vibe}' focus. {reason}" if interest_vibe else reason
            items.append(
                GeneratedRecommendationItem(
                    name=name,
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

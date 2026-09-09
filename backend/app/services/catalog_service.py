import re
import math
import hashlib
from typing import List, Optional, Tuple
from backend.app.schemas.booking import (
    HotelCatalogItem,
    RoomTypeOption,
    RestaurantCatalogItem,
    NearbyHotelResult,
    NearbyRestaurantResult
)

CURATED_HOTELS: List[HotelCatalogItem] = [
    # TOKYO
    HotelCatalogItem(
        id="htl-tok-01",
        name="Park Hyatt Tokyo",
        destination="Tokyo",
        tier="Luxury 5-Star",
        rating=4.9,
        reviews_count=1240,
        price_per_night=540.0,
        currency="USD",
        address="3-7-1-2 Nishi-Shinjuku, Shinjuku-ku, Tokyo 163-1055",
        neighborhood="Shinjuku High-Rise District",
        amenities=["Peak Lounge Bar", "Indoor Horizon Pool", "Club on the Park Spa", "High-speed Wi-Fi", "Concierge 24/7", "Valet Parking"],
        room_types=[
            RoomTypeOption(name="Park View King", price_per_night=540.0, description="Panoramic Mount Fuji & skyline views, deep soaking tub", capacity=2),
            RoomTypeOption(name="Park Deluxe Twin", price_per_night=620.0, description="Spacious twin beds with city vistas and marble bath", capacity=2),
            RoomTypeOption(name="Diplomat Suite", price_per_night=1250.0, description="Expansive salon, dining area, private sauna access", capacity=3)
        ],
        image_url="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80",
        description="Iconic Shinjuku sanctuary occupying the top 14 floors of the 52-story tower. Celebrated for quiet luxury, jazz lounge, and unrivaled city perspectives.",
        latitude=35.6853,
        longitude=139.6912
    ),
    HotelCatalogItem(
        id="htl-tok-02",
        name="TRUNK(HOTEL) Yoyogi Park",
        destination="Tokyo",
        tier="Boutique Design",
        rating=4.8,
        reviews_count=860,
        price_per_night=380.0,
        currency="USD",
        address="1-15-2 Tomigaya, Shibuya-ku, Tokyo 151-0063",
        neighborhood="Tomigaya / Shibuya",
        amenities=["Rooftop Heated Pool", "Specialty Oyster & Wine Bar", "Complimentary Designer Bikes", "Artisan Coffee Bar"],
        room_types=[
            RoomTypeOption(name="Park View Standard", price_per_night=380.0, description="Minimalist cedar finishes, balcony overlooking lush Yoyogi Park", capacity=2),
            RoomTypeOption(name="Owner's Suite", price_per_night=790.0, description="Private terrace with fireplace and plunge pool access", capacity=3)
        ],
        image_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
        description="A contemporary boutique haven where urban Japanese craft meets tranquil park greenery, minutes away from the energy of Shibuya crossing.",
        latitude=35.6668,
        longitude=139.6918
    ),
    HotelCatalogItem(
        id="htl-tok-03",
        name="Hoshinoya Tokyo",
        destination="Tokyo",
        tier="Traditional Ryokan Reimagined",
        rating=4.95,
        reviews_count=670,
        price_per_night=720.0,
        currency="USD",
        address="1-9-1 Otemachi, Chiyoda-ku, Tokyo 100-0004",
        neighborhood="Otemachi Financial Center",
        amenities=["Natural Hot Spring Onsen", "Shoe-Free Tatami Floors", "Exclusive Tea Ceremonies", "Nippon Cuisine Dining"],
        room_types=[
            RoomTypeOption(name="Kiku (Executive Ryokan)", price_per_night=720.0, description="Spacious corner tatami room with dining lounge", capacity=3),
            RoomTypeOption(name="Yuri (Deluxe)", price_per_night=840.0, description="Deep bamboo soaking tub and shoji screen partitions", capacity=2)
        ],
        image_url="https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=80",
        description="An 18-story ryokan tower in the heart of Tokyo with hot-spring waters drawn from 1,500 meters below ground.",
        latitude=35.6882,
        longitude=139.7644
    ),

    # PARIS
    HotelCatalogItem(
        id="htl-par-01",
        name="Hôtel de Crillon, Rosewood",
        destination="Paris",
        tier="Palace Luxury",
        rating=4.95,
        reviews_count=980,
        price_per_night=950.0,
        currency="EUR",
        address="10 Place de la Concorde, 75008 Paris",
        neighborhood="8th Arrondissement / Concorde",
        amenities=["Sense Spa & Pool", "Butler Service", "Jardin d'Hiver Afternoon Tea", "Courtyard Terraces", "Valet"],
        room_types=[
            RoomTypeOption(name="Premier Room", price_per_night=950.0, description="Neo-classical Parisian interior, bespoke French amenities", capacity=2),
            RoomTypeOption(name="Duc de Crillon Suite", price_per_night=2100.0, description="Karl Lagerfeld curated suite overlooking Place de la Concorde", capacity=2)
        ],
        image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
        description="Historic 18th-century palace hotel combining royal heritage with Parisian haute couture flair on the iconic Place de la Concorde.",
        latitude=48.8672,
        longitude=2.3218
    ),
    HotelCatalogItem(
        id="htl-par-02",
        name="The Hoxton, Paris",
        destination="Paris",
        tier="Chic Urban Boutique",
        rating=4.75,
        reviews_count=1450,
        price_per_night=280.0,
        currency="EUR",
        address="30-32 Rue du Sentier, 75002 Paris",
        neighborhood="Sentier / Grands Boulevards",
        amenities=["Rivié French Brasserie", "Speakeasy Jacques' Bar", "Inner Courtyard", "Pet Friendly", "Coworking Space"],
        room_types=[
            RoomTypeOption(name="Cosy Room", price_per_night=280.0, description="Chevron timber floors, velvet headboards, brass fixtures", capacity=2),
            RoomTypeOption(name="Roomy King", price_per_night=360.0, description="High ceilings with courtyard outlook and walk-in rain shower", capacity=2)
        ],
        image_url="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
        description="Set in an 18th-century rococo hôtel particulier, buzzing with creative Parisian energy and stylish courtyards.",
        latitude=48.8699,
        longitude=2.3463
    ),

    # ROME
    HotelCatalogItem(
        id="htl-rom-01",
        name="Singer Palace Hotel",
        destination="Rome",
        tier="Boutique Historical",
        rating=4.88,
        reviews_count=710,
        price_per_night=410.0,
        currency="EUR",
        address="Via del Corso 267, 00186 Rome",
        neighborhood="Trevi / Pantheon",
        amenities=["Rooftop Lounge & Restaurant", "Art Deco Bar", "Complimentary Breakfast", "Turn-Down Service"],
        room_types=[
            RoomTypeOption(name="Superior Double", price_per_night=410.0, description="Polished parquet flooring, Italian marble bathroom", capacity=2),
            RoomTypeOption(name="Corso Suite", price_per_night=680.0, description="Private balcony overlooking historic Via del Corso", capacity=3)
        ],
        image_url="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=1000&q=80",
        description="Built in the early 20th century as the Singer sewing machine headquarters, transformed into an intimate 30-room boutique hotel.",
        latitude=41.8986,
        longitude=12.4813
    ),

    # NEW YORK
    HotelCatalogItem(
        id="htl-nyc-01",
        name="1 Hotel Brooklyn Bridge",
        destination="New York",
        tier="Eco-Luxury Waterfront",
        rating=4.85,
        reviews_count=1890,
        price_per_night=475.0,
        currency="USD",
        address="60 Furman St, Brooklyn, NY 11201",
        neighborhood="DUMBO / Brooklyn Heights",
        amenities=["Rooftop Plunge Pool & Bar", "Bamford Wellness Spa", "Electric Car House Service", "Skyline River Views"],
        room_types=[
            RoomTypeOption(name="DUMBO King", price_per_night=475.0, description="Reclaimed wood decor, organic cotton bedding, East River view", capacity=2),
            RoomTypeOption(name="Skyline Studio Suite", price_per_night=780.0, description="Floor-to-ceiling vistas of Manhattan skyline and Brooklyn Bridge", capacity=3)
        ],
        image_url="https://images.unsplash.com/photo-1561501900-3701fa6a0864?auto=format&fit=crop&w=1000&q=80",
        description="Sustainable waterfront sanctuary steps from Brooklyn Bridge Park, offering sweeping cinematic views of lower Manhattan.",
        latitude=40.7022,
        longitude=-73.9967
    ),

    # SWISS ALPS
    HotelCatalogItem(
        id="htl-alp-01",
        name="The Omnia Mountain Lodge",
        destination="Swiss Alps",
        tier="Alpine Luxury Design",
        rating=4.96,
        reviews_count=640,
        price_per_night=690.0,
        currency="CHF",
        address="Auf dem Fels, 3920 Zermatt, Switzerland",
        neighborhood="Zermatt Village Rock",
        amenities=["Indoor/Outdoor Matterhorn Pool", "Finnish Rock Sauna", "Fireplace Library", "Michelin Dining"],
        room_types=[
            RoomTypeOption(name="Matterhorn Queen", price_per_night=690.0, description="Direct views of the Matterhorn pyramid and open fireplace", capacity=2),
            RoomTypeOption(name="Omnia Tower Suite", price_per_night=1150.0, description="Private telescope, rooftop terrace, and cedar hot tub", capacity=2)
        ],
        image_url="https://images.unsplash.com/photo-1502784444187-359ac186c5bb?auto=format&fit=crop&w=1000&q=80",
        description="Perched high above Zermatt on a rocky outcrop entered via a cavern tunnel, fusing American modernist architecture with Alpine warmth.",
        latitude=45.9765,
        longitude=7.7489
    ),

    # REYKJAVIK
    HotelCatalogItem(
        id="htl-rey-01",
        name="The Retreat at Blue Lagoon",
        destination="Reykjavik",
        tier="Geothermal Sanctuary",
        rating=4.97,
        reviews_count=820,
        price_per_night=880.0,
        currency="EUR",
        address="Nordurljosavegur 9, 240 Grindavík, Iceland",
        neighborhood="Reykjanes UNESCO Geopark",
        amenities=["Private Subterranean Lagoon", "Retreat Spa & Silica Ritual", "Moss Michelin-Star Restaurant", "Aurora Wake-Up Call"],
        room_types=[
            RoomTypeOption(name="Lava View Junior Suite", price_per_night=880.0, description="Floor-to-ceiling windows looking out over moss-covered volcanic field", capacity=2),
            RoomTypeOption(name="Lagoon Suite", price_per_night=1450.0, description="Direct private access into the mineral-rich geothermal waters", capacity=2)
        ],
        image_url="https://images.unsplash.com/photo-1527668752968-14dc70a27c95?auto=format&fit=crop&w=1000&q=80",
        description="Built directly into an 800-year-old lava field, offering an exclusive wellness journey powered by clean volcanic thermal springs.",
        latitude=63.8804,
        longitude=-22.4495
    )
]

CURATED_RESTAURANTS: List[RestaurantCatalogItem] = [
    # TOKYO
    RestaurantCatalogItem(
        id="res-tok-01",
        name="Narisawa",
        destination="Tokyo",
        tier="Innovative Satoyama",
        cuisine="Modern Japanese / Sustainable Fine Dining",
        price_tier="$$$$ (Fine Dining)",
        rating=4.92,
        reviews_count=930,
        address="2-6-15 Minami-Aoyama, Minato-ku, Tokyo",
        neighborhood="Minami-Aoyama",
        vibe="Intimate, tranquil zen minimalism with open plating pass",
        signature_dishes=["Bread of the Forest 2010", "Soup of the Soil", "Charcoal Grilled Matsusaka Beef"],
        dietary_options=["Pescatarian Accommodated", "Gluten-Free upon request", "No Shellfish"],
        available_times=["12:30", "13:00", "18:00", "19:00", "20:30"],
        image_url="https://images.unsplash.com/photo-1578474846511-04ba529f0b88?auto=format&fit=crop&w=1000&q=80",
        description="2-Michelin-star benchmark celebrating the harmony of Japanese satoyama culture, forests, and pristine seas.",
        latitude=35.6705,
        longitude=139.7198
    ),
    RestaurantCatalogItem(
        id="res-tok-02",
        name="Afuri Ramen Harajuku",
        destination="Tokyo",
        tier="Casual Gourmet",
        cuisine="Yuzu Shio Ramen & Craft Gyoza",
        price_tier="$ (Casual)",
        rating=4.78,
        reviews_count=2300,
        address="1-1-7 Ebisu, Shibuya-ku, Tokyo",
        neighborhood="Ebisu / Harajuku",
        vibe="Sleek chrome counter, upbeat indie lo-fi beats, lively open kitchen",
        signature_dishes=["Yuzu Shio Ramen (Signature Citrus Broth)", "Charred Chashu Rice Bowl", "Crispy Pork Gyoza"],
        dietary_options=["Vegan Ramen Option Available", "Vegetarian Broth", "Gluten-Free Shirataki Noodles"],
        available_times=["11:30", "13:00", "17:30", "19:00", "21:00", "22:30"],
        image_url="https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=1000&q=80",
        description="Famed for its refreshing citrus-scented chicken broth simmered with natural spring water from Mount Afuri.",
        latitude=35.6702,
        longitude=139.7042
    ),

    # PARIS
    RestaurantCatalogItem(
        id="res-par-01",
        name="Septime",
        destination="Paris",
        tier="Modern Neo-Bistro",
        cuisine="Contemporary French Farm-to-Table",
        price_tier="$$$ (Upscale Casual)",
        rating=4.89,
        reviews_count=1180,
        address="80 Rue de Charonne, 75011 Paris",
        neighborhood="11th Arrondissement / Charonne",
        vibe="Industrial zinc bar, raw oak tables, lively unpretentious natural wine bar atmosphere",
        signature_dishes=["Hay-Smoked Egg Yolk with Cepes", "Line-Caught Pollack with Green Asparagus", "Wild Strawberry Sorbet"],
        dietary_options=["Vegetarian Tasting Available", "Nut Allergies accommodated"],
        available_times=["12:15", "13:30", "19:30", "20:45", "21:30"],
        image_url="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
        description="One of the world's most coveted reservations, masterminded by Bertrand Grébaut with sustainable bio-dynamic ethics.",
        latitude=48.8534,
        longitude=2.3812
    ),
    RestaurantCatalogItem(
        id="res-par-02",
        name="Le Comptoir du Relais",
        destination="Paris",
        tier="Classic Parisian Brasserie",
        cuisine="Classic Bourgeoise French Cuisine",
        price_tier="$$ (Moderate)",
        rating=4.72,
        reviews_count=1920,
        address="9 Carrefour de l'Odéon, 75006 Paris",
        neighborhood="Saint-Germain-des-Prés",
        vibe="Bustling sidewalk terrace, Parisian wicker chairs, vintage mirrors and brass racks",
        signature_dishes=["Terrine de Foie Gras", "Braised Beef Cheeks in Red Wine", "Floating Island Meringue"],
        dietary_options=["Traditional French - Meat & Seafood focused", "Gluten-Free adaptations"],
        available_times=["12:00", "14:00", "19:00", "20:30", "22:00"],
        image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
        description="Chef Yves Camdeborde's beloved Left Bank brasserie, iconic for authentic hearty French classics and terrace dining.",
        latitude=48.8519,
        longitude=2.3385
    ),

    # ROME
    RestaurantCatalogItem(
        id="res-rom-01",
        name="Roscioli Salumeria con Cucina",
        destination="Rome",
        tier="Epicurean Wine & Deli Kitchen",
        cuisine="Authentic Roman Classics & Artisan Charcuterie",
        price_tier="$$$ (Upscale)",
        rating=4.91,
        reviews_count=2150,
        address="Via dei Giubbonari 21, 00186 Rome",
        neighborhood="Campo de' Fiori",
        vibe="Surrounded by thousands of hand-selected wine bottles, cured prosciuttos and artisanal cheese wheels",
        signature_dishes=["Legendary Carbonara with Crispy Guanciale", "Burrata Pugliese with Semi-Secchi Tomatoes", "Cacio e Pepe"],
        dietary_options=["Vegetarian Pasta options", "Pescatarian available"],
        available_times=["12:30", "14:00", "19:30", "21:00", "22:15"],
        image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1000&q=80",
        description="Rome's culinary temple of pasta perfection and curated Italian salumi, renowned worldwide for its gold-standard carbonara.",
        latitude=41.8943,
        longitude=12.4746
    ),

    # NEW YORK
    RestaurantCatalogItem(
        id="res-nyc-01",
        name="Gramercy Tavern",
        destination="New York",
        tier="American Heritage Icon",
        cuisine="Contemporary Farmhouse American",
        price_tier="$$$$ (Fine Dining)",
        rating=4.87,
        reviews_count=2640,
        address="42 E 20th St, New York, NY 10003",
        neighborhood="Flatiron / Gramercy",
        vibe="Warm wood hearth, seasonal floral centerpieces, welcoming hospitality",
        signature_dishes=["Wood-Grilled Pork Loin", "Handmade Cavatelli with Braised Duck", "Warm Chocolate Bread Pudding"],
        dietary_options=["Vegetarian Tasting Menu", "Dairy-Free Upon Request", "Nut Allergy Safe"],
        available_times=["12:00", "13:30", "17:45", "19:15", "20:45"],
        image_url="https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1000&q=80",
        description="Danny Meyer's timeless New York landmark setting the benchmark for warm hospitality and farm-fresh tavern cuisine.",
        latitude=40.7388,
        longitude=-73.9884
    ),

    # SWISS ALPS
    RestaurantCatalogItem(
        id="res-alp-01",
        name="Chez Vrony",
        destination="Swiss Alps",
        tier="Alpine Haute Chalet",
        cuisine="Swiss Alpine & Mountain Farm Specialties",
        price_tier="$$$ (Upscale Lodge)",
        rating=4.94,
        reviews_count=980,
        address="Findeln, 3920 Zermatt, Switzerland",
        neighborhood="Findeln Mountain Slopes",
        vibe="Sun-drenched sheepskin terrace directly facing the Matterhorn crest",
        signature_dishes=["Vrony Burger with Alpine Cheese", "Walliser Dry-Cured Beef & Bergkäse Carpaccio", "Blood Sausage Ravioli"],
        dietary_options=["Vegetarian Fondue & Salads", "Gluten-Free bread available"],
        available_times=["11:45", "13:00", "14:15", "15:30"],
        image_url="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80",
        description="Historic 100-year-old alpine chalet resting at 2,100 meters, serving produce reared on their own mountain meadows.",
        latitude=46.0125,
        longitude=7.7788
    ),

    # REYKJAVIK
    RestaurantCatalogItem(
        id="res-rey-01",
        name="Dill Restaurant",
        destination="Reykjavik",
        tier="Pioneering New Nordic",
        cuisine="Foraged Arctic Nordic Tasting Experience",
        price_tier="$$$$ (Fine Dining)",
        rating=4.93,
        reviews_count=520,
        address="Laugavegur 59, 101 Reykjavík, Iceland",
        neighborhood="Downtown Reykjavík",
        vibe="Subtle candlelight, dark timber, intimate open kitchen with smoky birch wood scents",
        signature_dishes=["Smoked Arctic Char with Angelica", "Birch-Infused Potato Crisp with Sea Truffle", "Dill Herb Granita"],
        dietary_options=["Seafood & Plant forward", "Advance dietary notification required"],
        available_times=["18:00", "19:00", "20:30"],
        image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
        description="Iceland's first Michelin-starred institution, devoted to reviving ancestral Icelandic food traditions and wild Arctic herbs.",
        latitude=64.1437,
        longitude=-21.9281
    )
]

def _normalize(text: Optional[str]) -> str:
    if not text:
        return ""
    return re.sub(r"[^a-z0-9]", "", text.lower())

def _generate_fallback_hotels(destination: str) -> List[HotelCatalogItem]:
    clean_dest = destination.strip().title() if destination else "Destination"
    seed = int(hashlib.md5(clean_dest.encode()).hexdigest()[:6], 16)
    
    return [
        HotelCatalogItem(
            id=f"htl-{_normalize(clean_dest)[:6]}-01",
            name=f"The Grand {clean_dest} Sanctuary",
            destination=clean_dest,
            tier="5-Star Luxury",
            rating=4.9,
            reviews_count=420 + (seed % 300),
            price_per_night=340.0 + (seed % 180),
            currency="USD",
            address=f"1 Central Boulevard, {clean_dest}",
            neighborhood="Historic Quarter",
            amenities=["Skyline Rooftop Pool", "Full-Service Spa", "24/7 Concierge", "Valet Parking", "Artisan Breakfast"],
            room_types=[
                RoomTypeOption(name="Deluxe King Room", price_per_night=340.0 + (seed % 180), description="Panoramic city skyline views with king bed and marble bath", capacity=2),
                RoomTypeOption(name="Executive Suite", price_per_night=580.0 + (seed % 220), description="Corner suite with separate lounge and bespoke hospitality bar", capacity=3)
            ],
            image_url="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80",
            description=f"An architectural landmark in the heart of {clean_dest}, blending authentic cultural heritage with world-class contemporary comforts.",
            latitude=35.0,
            longitude=135.0
        ),
        HotelCatalogItem(
            id=f"htl-{_normalize(clean_dest)[:6]}-02",
            name=f"Nomad Atelier Hotel {clean_dest}",
            destination=clean_dest,
            tier="Boutique Heritage",
            rating=4.82,
            reviews_count=310 + (seed % 200),
            price_per_night=220.0 + (seed % 90),
            currency="USD",
            address=f"48 Artisans Way, {clean_dest}",
            neighborhood="Creative Arts District",
            amenities=["Courtyard Cafe", "Complimentary Bicycle Fleet", "High-Speed Fiber Wi-Fi", "Record Player in Room"],
            room_types=[
                RoomTypeOption(name="Atelier Queen", price_per_night=220.0 + (seed % 90), description="Handcrafted furniture, custom linens, and garden views", capacity=2),
                RoomTypeOption(name="Loft Studio", price_per_night=360.0 + (seed % 120), description="Double-height ceiling, mezzanine bed, and kitchenette", capacity=2)
            ],
            image_url="https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1000&q=80",
            description=f"A boutique retreat celebrating local craftspeople, organic architecture, and peaceful garden nooks in {clean_dest}.",
            latitude=35.01,
            longitude=135.02
        ),
        HotelCatalogItem(
            id=f"htl-{_normalize(clean_dest)[:6]}-03",
            name=f"{clean_dest} Horizon Modern Suites",
            destination=clean_dest,
            tier="Contemporary Minimalist",
            rating=4.75,
            reviews_count=580 + (seed % 150),
            price_per_night=175.0 + (seed % 70),
            currency="USD",
            address=f"12 Waterfront Esplanade, {clean_dest}",
            neighborhood="Waterfront Marina",
            amenities=["Fitness Studio", "Heated Lap Pool", "Self Check-In Kiosk", "Scenic Sundeck"],
            room_types=[
                RoomTypeOption(name="Panoramic Double", price_per_night=175.0 + (seed % 70), description="Minimalist light wood aesthetic with harbor views", capacity=2),
                RoomTypeOption(name="Family Panorama Suite", price_per_night=290.0 + (seed % 80), description="Interconnecting rooms with dual baths and kitchenette", capacity=4)
            ],
            image_url="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80",
            description=f"Modern, light-flooded suites situated right along the waterfront, engineered for seamless digital nomadic stays in {clean_dest}.",
            latitude=35.02,
            longitude=135.03
        )
    ]

def _generate_fallback_restaurants(destination: str) -> List[RestaurantCatalogItem]:
    clean_dest = destination.strip().title() if destination else "Destination"
    seed = int(hashlib.md5(clean_dest.encode()).hexdigest()[:6], 16)
    
    return [
        RestaurantCatalogItem(
            id=f"res-{_normalize(clean_dest)[:6]}-01",
            name=f"L'Atelier {clean_dest}",
            destination=clean_dest,
            tier="Contemporary Fine Dining",
            cuisine=f"Artisanal Farm-to-Table & Local Flavors",
            price_tier="$$$$ (Fine Dining)",
            rating=4.9,
            reviews_count=540 + (seed % 200),
            address=f"14 Market Square, {clean_dest}",
            neighborhood="Old Town Center",
            vibe="Warm architectural lighting, open demonstration kitchen, sommelier cellar",
            signature_dishes=[f"Locally Foraged Seasonal Tasting", f"Pan-Roasted Catch of {clean_dest}", "Honey & Herb Panna Cotta"],
            dietary_options=["Vegetarian Tasting Available", "Gluten-Free upon request"],
            available_times=["12:30", "13:30", "18:30", "19:45", "21:00"],
            image_url="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1000&q=80",
            description=f"Critically acclaimed dining experience highlighting seasonal produce harvested within 30 miles of {clean_dest}.",
            latitude=35.0,
            longitude=135.0
        ),
        RestaurantCatalogItem(
            id=f"res-{_normalize(clean_dest)[:6]}-02",
            name=f"{clean_dest} Rustic Hearth Bistro",
            destination=clean_dest,
            tier="Neighborhood Bistro",
            cuisine="Wood-Fired Specialties & Regional Wine",
            price_tier="$$ (Moderate)",
            rating=4.81,
            reviews_count=820 + (seed % 350),
            address=f"77 Cobblestone Lane, {clean_dest}",
            neighborhood="Historic Quarter",
            vibe="Exposed brick, roaring wood oven, friendly communal tables and natural wine list",
            signature_dishes=["Wood-Fired Sourdough Flatbread", "Slow-Braised Short Ribs", "Charred Leek & Truffle Dip"],
            dietary_options=["Vegan & Vegetarian options", "Dairy-Free alternatives"],
            available_times=["12:00", "13:15", "17:30", "19:00", "20:30", "22:00"],
            image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1000&q=80",
            description=f"A bustling neighborhood favourite in {clean_dest} serving generous, comfort-driven dishes cooked over fruitwood embers.",
            latitude=35.01,
            longitude=135.01
        ),
        RestaurantCatalogItem(
            id=f"res-{_normalize(clean_dest)[:6]}-03",
            name=f"Botanica Kitchen & Cocktails",
            destination=clean_dest,
            tier="Modern Green Oasis",
            cuisine="Fresh Fusion & Botanical Mixology",
            price_tier="$$$ (Upscale Casual)",
            rating=4.76,
            reviews_count=410 + (seed % 150),
            address=f"29 Green Promenade, {clean_dest}",
            neighborhood="Garden District",
            vibe="Indoor tropical glasshouse, hanging ferns, chill lounge grooves, crafted cocktails",
            signature_dishes=["Citrus Cured Salmon Crudo", "Roasted Cauliflower with Tahini & Pomegranate", "Smoked Rosemary Negroni"],
            dietary_options=["100% Plant-Based friendly", "Pescatarian certified"],
            available_times=["13:00", "14:30", "18:00", "19:30", "21:15"],
            image_url="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=80",
            description=f"A lush green haven in {clean_dest} where creative craft cocktails meet clean, herb-accented gastronomy.",
            latitude=35.02,
            longitude=135.02
        )
    ]

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate the great-circle distance between two points on Earth in kilometers."""
    R = 6371.0  # Earth radius in km
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)
    a = (
        math.sin(d_lat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(d_lon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


class CatalogService:
    def get_hotels(self, destination: Optional[str] = None) -> List[HotelCatalogItem]:
        if not destination or not destination.strip():
            return CURATED_HOTELS
        
        dest_norm = _normalize(destination)
        # Check if matches any curated hotels
        matches = [
            h for h in CURATED_HOTELS
            if dest_norm in _normalize(h.destination) or _normalize(h.destination) in dest_norm or dest_norm in _normalize(h.name)
        ]
        if matches:
            return matches
        
        # Fallback dynamic generator
        return _generate_fallback_hotels(destination)

    def get_restaurants(self, destination: Optional[str] = None) -> List[RestaurantCatalogItem]:
        if not destination or not destination.strip():
            return CURATED_RESTAURANTS
        
        dest_norm = _normalize(destination)
        matches = [
            r for r in CURATED_RESTAURANTS
            if dest_norm in _normalize(r.destination) or _normalize(r.destination) in dest_norm or dest_norm in _normalize(r.name)
        ]
        if matches:
            return matches
        
        return _generate_fallback_restaurants(destination)

    def get_nearby_hotels(
        self,
        spots: List[Tuple[float, float, str]],
        destination: Optional[str] = None,
    ) -> List[NearbyHotelResult]:
        """
        Find hotels near the user's tourist spots.

        Args:
            spots: List of (latitude, longitude, spot_name) tuples from itinerary items.
            destination: Optional destination string to scope hotel search.

        Returns:
            List of NearbyHotelResult sorted by distance to the nearest spot.
        """
        if not spots:
            return []

        hotels = self.get_hotels(destination)
        results: List[NearbyHotelResult] = []

        for hotel in hotels:
            if hotel.latitude is None or hotel.longitude is None:
                continue

            min_dist = float("inf")
            closest_spot_name = "Your itinerary"

            for lat, lng, name in spots:
                dist = _haversine_km(hotel.latitude, hotel.longitude, lat, lng)
                if dist < min_dist:
                    min_dist = dist
                    closest_spot_name = name

            results.append(
                NearbyHotelResult(
                    hotel=hotel,
                    distance_km=round(min_dist, 1),
                    nearest_spot=closest_spot_name,
                )
            )

        results.sort(key=lambda r: r.distance_km)
        return results

    def get_nearby_restaurants(
        self,
        spots: List[Tuple[float, float, str]],
        destination: Optional[str] = None,
    ) -> List[NearbyRestaurantResult]:
        """
        Find dining spots and restaurants near the user's tourist spots.

        Args:
            spots: List of (latitude, longitude, spot_name) tuples from itinerary items.
            destination: Optional destination string to scope restaurant search.

        Returns:
            List of NearbyRestaurantResult sorted by distance to the nearest spot.
        """
        if not spots:
            return []

        restaurants = self.get_restaurants(destination)
        results: List[NearbyRestaurantResult] = []

        for rest in restaurants:
            if rest.latitude is None or rest.longitude is None:
                continue

            min_dist = float("inf")
            closest_spot_name = "Your itinerary"

            for lat, lng, name in spots:
                dist = _haversine_km(rest.latitude, rest.longitude, lat, lng)
                if dist < min_dist:
                    min_dist = dist
                    closest_spot_name = name

            results.append(
                NearbyRestaurantResult(
                    restaurant=rest,
                    distance_km=round(min_dist, 1),
                    nearest_spot=closest_spot_name,
                )
            )

        results.sort(key=lambda r: r.distance_km)
        return results


catalog_service = CatalogService()

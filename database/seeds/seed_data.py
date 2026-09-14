import sys
import os
from datetime import datetime, timedelta, timezone
from decimal import Decimal

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from backend.app.core.database import SessionLocal, Base, engine
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.models.friendship import Friendship, FriendRequest, FriendRequestStatus
from backend.app.models.trip import Trip, TripMember, TripRole, TripStatus
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.models.recommendation import Recommendation
from backend.app.models.flight import Flight, FlightStatus, FlightStatusHistory
from backend.app.models.expense import Expense, ExpenseParticipant, Settlement, ExpenseCategory, SplitType
from backend.app.models.chat import ChatMessage
from backend.app.models.notification import Notification, NotificationType
from backend.app.models.booking import Booking
from backend.app.services.expenses.calculator import expense_calculator

def seed_database():
    print("[INFO] Resetting and creating database tables...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        print("[INFO] Creating seed users...")
        now = datetime.now(timezone.utc)
        pwd_hash = get_password_hash("password123")

        u1 = User(
            email="alex@arcnomad.com",
            username="alex_nomad",
            hashed_password=pwd_hash,
            full_name="Alex Mercer",
            avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
            bio="Nomadic product architect & urban photographer. Passionate about culinary culture and architectural marvels.",
            travel_interests=["Photography", "Gastronomy", "Architecture", "Nightlife"],
            travel_style="Balanced",
            budget_preference="Moderate"
        )
        u2 = User(
            email="sarah@arcnomad.com",
            username="sarah_voyage",
            hashed_password=pwd_hash,
            full_name="Sarah Jenkins",
            avatar_url="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
            bio="Solo wanderer, alpine hiker, and coffee enthusiast. Always searching for the highest peaks and quietest cafes.",
            travel_interests=["Hiking", "Nature", "Art", "Coffee Culture"],
            travel_style="Adventure",
            budget_preference="Moderate"
        )
        u3 = User(
            email="marco@arcnomad.com",
            username="marco_explorer",
            hashed_password=pwd_hash,
            full_name="Marco Rossi",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
            bio="History buff & culinary explorer from Florence. I travel to taste history in every dish.",
            travel_interests=["History", "Wine Tasting", "Cooking", "Sailing"],
            travel_style="Cultural",
            budget_preference="Luxury"
        )
        u4 = User(
            email="elena@arcnomad.com",
            username="elena_wander",
            hashed_password=pwd_hash,
            full_name="Elena Rostova",
            avatar_url="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
            bio="Digital designer & scuba diver. Seeking hidden gems and neon-lit nightscapes across the Pacific.",
            travel_interests=["Design", "Diving", "Hidden Gems", "Music Festivals"],
            travel_style="Fast-Paced",
            budget_preference="Moderate"
        )

        db.add_all([u1, u2, u3, u4])
        db.commit()
        db.refresh(u1); db.refresh(u2); db.refresh(u3); db.refresh(u4)

        print("[INFO] Creating friendships...")
        f1 = Friendship(user_id=u1.id, friend_id=u2.id)
        f2 = Friendship(user_id=u1.id, friend_id=u3.id)
        f3 = Friendship(user_id=u1.id, friend_id=u4.id)
        f4 = Friendship(user_id=u2.id, friend_id=u3.id)
        db.add_all([f1, f2, f3, f4])
        db.commit()

        print("[INFO] Creating seed trips...")
        # Trip 1: Tokyo Sakura & Cyberpunk Expedition (Active / Featured)
        start_t1 = now + timedelta(days=5)
        end_t1 = start_t1 + timedelta(days=6)

        trip1 = Trip(
            title="Tokyo Sakura & Cyberpunk Expedition",
            description="A 7-day high-energy journey through neon alleyways, historic Shinto shrines, Michelin omakase, and futuristic art labyrinths.",
            destination="Tokyo, Japan",
            destination_lat=35.6762,
            destination_lng=139.6503,
            start_date=start_t1,
            end_date=end_t1,
            budget=Decimal("4500.00"),
            currency="USD",
            cover_image="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80",
            status=TripStatus.ACTIVE.value,
            owner_id=u1.id
        )
        db.add(trip1)
        db.commit()
        db.refresh(trip1)

        # Members for Trip 1
        m1 = TripMember(trip_id=trip1.id, user_id=u1.id, role=TripRole.OWNER.value)
        m2 = TripMember(trip_id=trip1.id, user_id=u2.id, role=TripRole.EDITOR.value)
        m3 = TripMember(trip_id=trip1.id, user_id=u4.id, role=TripRole.EXPENSE_MANAGER.value)
        db.add_all([m1, m2, m3])
        db.commit()

        # Itinerary Days & Items for Trip 1
        print("[INFO] Seeding Day-by-Day Itinerary...")
        day1 = ItineraryDay(trip_id=trip1.id, day_number=1, date=start_t1, notes="Arrival, Shinjuku neon exploration & Golden Gai izakaya tour.")
        day2 = ItineraryDay(trip_id=trip1.id, day_number=2, date=start_t1 + timedelta(days=1), notes="Asakusa ancient heritage, Senso-ji temple & Akihabara tech district.")
        day3 = ItineraryDay(trip_id=trip1.id, day_number=3, date=start_t1 + timedelta(days=2), notes="teamLab Planets digital wonderland & waterfront dining in Toyosu.")
        day4 = ItineraryDay(trip_id=trip1.id, day_number=4, date=start_t1 + timedelta(days=3), notes="Shibuya Crossing, Meiji Jingu shrine forest & Harajuku fashion lanes.")
        day5 = ItineraryDay(trip_id=trip1.id, day_number=5, date=start_t1 + timedelta(days=4), notes="Day trip to Mount Fuji & Hakone hot springs.")
        day6 = ItineraryDay(trip_id=trip1.id, day_number=6, date=start_t1 + timedelta(days=5), notes="Ginza artisan boutiques, luxury shopping & farewell Kaiseki feast.")
        db.add_all([day1, day2, day3, day4, day5, day6])
        db.commit()
        db.refresh(day1); db.refresh(day2); db.refresh(day3); db.refresh(day4)

        items_day1 = [
            ItineraryItem(
                day_id=day1.id, trip_id=trip1.id, title="Tokyo Haneda Arrival & Express Monorail",
                description="Touchdown at HND Terminal 3. Pick up pocket Wi-Fi and take the Tokyo Monorail to Shinjuku.",
                location_name="Haneda Airport (HND)", address="Ota City, Tokyo 144-0041",
                latitude=35.5494, longitude=139.7798, start_time="14:30", end_time="16:00",
                category="TRANSPORT", estimated_cost=Decimal("15.00"), order_index=0, notes="Validate JR Pass vouchers at the airport counter."
            ),
            ItineraryItem(
                day_id=day1.id, trip_id=trip1.id, title="Check-in at Hotel Gracery Shinjuku",
                description="Drop luggage at the iconic Godzilla-themed hotel right in the heart of Kabukicho.",
                location_name="Hotel Gracery Shinjuku", address="1-19-1 Kabukicho, Shinjuku City, Tokyo",
                latitude=35.6951, longitude=139.7020, start_time="16:30", end_time="17:30",
                category="HOTEL", estimated_cost=Decimal("0.00"), order_index=1, notes="Room keys requested on upper floors."
            ),
            ItineraryItem(
                day_id=day1.id, trip_id=trip1.id, title="Shinjuku Omoide Yokocho Yakitori Alley",
                description="Atmospheric lantern-lit alleyway famous for charcoal grilled skewers, craft sake, and cozy izakayas.",
                location_name="Omoide Yokocho (Memory Lane)", address="1 Chome-2 Nishishinjuku, Shinjuku City",
                latitude=35.6930, longitude=139.6996, start_time="18:30", end_time="20:30",
                category="FOOD", estimated_cost=Decimal("45.00"), order_index=2, notes="Cash only at most stalls."
            ),
            ItineraryItem(
                day_id=day1.id, trip_id=trip1.id, title="Tokyo Metropolitan Government Building Observatory",
                description="360-degree panoramic night vistas from 202 meters up with twinkling lights spanning Mount Fuji to Tokyo Tower.",
                location_name="Tokyo Metropolitan Gov Bldg", address="2-8-1 Nishishinjuku, Shinjuku City",
                latitude=35.6896, longitude=139.6921, start_time="21:00", end_time="22:30",
                category="SIGHTSEEING", estimated_cost=Decimal("0.00"), order_index=3, notes="Admission is completely free."
            ),
        ]

        items_day2 = [
            ItineraryItem(
                day_id=day2.id, trip_id=trip1.id, title="Senso-ji Temple & Nakamise Street",
                description="Tokyo's oldest Buddhist temple with giant red thunder gate lanterns and incense rituals.",
                location_name="Senso-ji Temple", address="2-3-1 Asakusa, Taito City, Tokyo",
                latitude=35.7148, longitude=139.7967, start_time="09:00", end_time="11:30",
                category="SIGHTSEEING", estimated_cost=Decimal("10.00"), order_index=0, notes="Sample freshly toasted ningyo-yaki bean cakes."
            ),
            ItineraryItem(
                day_id=day2.id, trip_id=trip1.id, title="Tsukiji Outer Seafood Market Brunch",
                description="Freshly torched tuna nigiri, tamagoyaki omelet sticks, and wagyu skewers.",
                location_name="Tsukiji Outer Market", address="4 Chome Tsukiji, Chuo City, Tokyo",
                latitude=35.6655, longitude=139.7708, start_time="12:00", end_time="14:00",
                category="FOOD", estimated_cost=Decimal("50.00"), order_index=1, notes="Arrive before peak rush."
            ),
            ItineraryItem(
                day_id=day2.id, trip_id=trip1.id, title="Akihabara Electric Town & Retro Arcades",
                description="Explore multi-story electronics department stores, retro Super Potato gaming shops, and arcade claw towers.",
                location_name="Akihabara Electric Town", address="Sotokanda, Chiyoda City, Tokyo",
                latitude=35.6984, longitude=139.7731, start_time="14:30", end_time="18:00",
                category="ACTIVITY", estimated_cost=Decimal("30.00"), order_index=2, notes="Visit GiGO arcade center on Chuo Dori."
            )
        ]

        items_day3 = [
            ItineraryItem(
                day_id=day3.id, trip_id=trip1.id, title="teamLab Planets Immersive Digital Art Museum",
                description="Walk through knee-deep water mirrors, crystal flower vortexes, and floating infinite light gardens.",
                location_name="teamLab Planets TOKYO", address="6-1-16 Toyosu, Koto City, Tokyo",
                latitude=35.6491, longitude=139.7898, start_time="10:00", end_time="13:00",
                category="ACTIVITY", estimated_cost=Decimal("38.00"), order_index=0, notes="Wear shorts or rolled up pants for water exhibits."
            ),
            ItineraryItem(
                day_id=day3.id, trip_id=trip1.id, title="Toyosu Fish Market & Sushi Omakase",
                description="High-grade bluefin tuna and sea urchin nigiri at famous Daiwa Sushi.",
                location_name="Daiwa Sushi Toyosu", address="6-5-1 Toyosu, Koto City, Tokyo",
                latitude=35.6450, longitude=139.7845, start_time="13:30", end_time="15:30",
                category="FOOD", estimated_cost=Decimal("80.00"), order_index=1, notes="Pre-booked omakase counter seat."
            ),
            ItineraryItem(
                day_id=day3.id, trip_id=trip1.id, title="Odaiba Seaside Park & Rainbow Bridge Sunset",
                description="Futuristic bay skyline with giant life-sized Unicorn Gundam transformation show and beachfront boardwalk.",
                location_name="Odaiba Seaside Park", address="Daiba, Minato City, Tokyo",
                latitude=35.6288, longitude=139.7744, start_time="17:00", end_time="20:00",
                category="SIGHTSEEING", estimated_cost=Decimal("0.00"), order_index=2, notes="Gundam light show at 19:30."
            )
        ]

        db.add_all(items_day1 + items_day2 + items_day3)
        db.commit()

        # Flights for Trip 1
        print("[INFO] Seeding Flights & Monitoring History...")
        f1_flight = Flight(
            trip_id=trip1.id,
            user_id=u1.id,
            airline="All Nippon Airways",
            flight_number="NH11",
            departure_airport="ORD",
            arrival_airport="HND",
            departure_city="Chicago",
            arrival_city="Tokyo",
            departure_time=start_t1 - timedelta(hours=14),
            arrival_time=start_t1,
            terminal="T3",
            gate="B14",
            status=FlightStatus.SCHEDULED.value,
            seat="12A",
            booking_reference="NH-8829104",
            notes="Direct Dreamliner 787-9 flight. Meal selected: Japanese Washoku."
        )
        f2_flight = Flight(
            trip_id=trip1.id,
            user_id=u2.id,
            airline="Japan Airlines",
            flight_number="JL005",
            departure_airport="JFK",
            arrival_airport="HND",
            departure_city="New York",
            arrival_city="Tokyo",
            departure_time=start_t1 - timedelta(hours=15),
            arrival_time=start_t1 - timedelta(hours=1),
            terminal="T3",
            gate="A08",
            status=FlightStatus.SCHEDULED.value,
            seat="24K",
            booking_reference="JL-449102",
            notes="Flight confirmed."
        )
        db.add_all([f1_flight, f2_flight])
        db.commit()

        # Recommendations for Trip 1
        print("[INFO] Seeding Curated Recommendations...")
        recs = [
            Recommendation(
                trip_id=trip1.id, name="Gonpachi Nishi-Azabu (Kill Bill Restaurant)",
                category="Restaurants", description="Historic multi-tier tavern that inspired the famous movie battle scene. Superb handmade soba and yakitori.",
                rating=4.8, price_level="$$$", address="1-13-11 Nishi-Azabu, Minato City, Tokyo",
                latitude=35.6601, longitude=139.7238, reason="Recommended for cinematic heritage and lively evening ambiance.",
                tags=["Cinematic", "Soba", "Izakaya"], is_saved=True
            ),
            Recommendation(
                trip_id=trip1.id, name="Bar Trench (Speakeasy Cocktail Bar)",
                category="Nightlife", description="Ranked among Asia's Top 50 Bars. Intimate herbal absinthe and botanical concoctions served in antique glassware.",
                rating=4.9, price_level="$$$", address="1-5-8 Ebisu Nishi, Shibuya City, Tokyo",
                latitude=35.6482, longitude=139.7076, reason="Matches your interest in bespoke nightlife and hidden speakeasies.",
                tags=["Cocktails", "Top 50", "Intimate"], is_saved=True
            ),
            Recommendation(
                trip_id=trip1.id, name="Ghibli Museum Mitaka",
                category="Attractions", description="Enchanting animation museum designed by Hayao Miyazaki, featuring exclusive short films and whimsical rooftop robots.",
                rating=4.9, price_level="$$", address="1-1-83 Shimorenjaku, Mitaka, Tokyo",
                latitude=35.6963, longitude=139.5704, reason="Recommended because you appreciate iconic Japanese art and visual design.",
                tags=["Ghibli", "Anime", "Family"], is_saved=False
            ),
            Recommendation(
                trip_id=trip1.id, name="Fuglen Tokyo Coffee & Vintage Nordic Lounge",
                category="Cafes", description="World-famous Norwegian light roast coffee by day, stylish cocktail lounge by night located near Yoyogi Park.",
                rating=4.7, price_level="$$", address="1-16-11 Tomigaya, Shibuya City, Tokyo",
                latitude=35.6681, longitude=139.6912, reason="Recommended for premium single-origin coffee in a mid-century Scandinavian setting.",
                tags=["Coffee", "Vibes", "Cocktails"], is_saved=True
            )
        ]
        db.add_all(recs)
        db.commit()

        # Expenses & Splitting for Trip 1
        print("[INFO] Seeding Expenses & Split Calculations...")
        exp1 = Expense(
            trip_id=trip1.id, paid_by_user_id=u1.id, amount=Decimal("360.00"), currency="USD",
            category=ExpenseCategory.HOTEL.value, description="Deposit for Shinjuku Hotel Gracery",
            expense_date=now - timedelta(days=2), split_type=SplitType.EQUAL.value, notes="Covers first 2 nights shared suite."
        )
        db.add(exp1)
        db.flush()
        # 3-way split: u1, u2, u4 ($120 each)
        for u in [u1, u2, u4]:
            db.add(ExpenseParticipant(expense_id=exp1.id, user_id=u.id, share_amount=Decimal("120.00"), share_percentage=33.33))

        exp2 = Expense(
            trip_id=trip1.id, paid_by_user_id=u2.id, amount=Decimal("114.00"), currency="USD",
            category=ExpenseCategory.TICKETS.value, description="teamLab Planets Fast-Track Tickets (x3)",
            expense_date=now - timedelta(days=1), split_type=SplitType.EQUAL.value, notes="Reserved morning slot."
        )
        db.add(exp2)
        db.flush()
        for u in [u1, u2, u4]:
            db.add(ExpenseParticipant(expense_id=exp2.id, user_id=u.id, share_amount=Decimal("38.00"), share_percentage=33.33))

        exp3 = Expense(
            trip_id=trip1.id, paid_by_user_id=u4.id, amount=Decimal("225.00"), currency="USD",
            category=ExpenseCategory.FOOD.value, description="Welcome Dinner at Shinjuku Omoide Yokocho",
            expense_date=now, split_type=SplitType.EQUAL.value, notes="Yakitori, beer and sake tasting."
        )
        db.add(exp3)
        db.flush()
        for u in [u1, u2, u4]:
            db.add(ExpenseParticipant(expense_id=exp3.id, user_id=u.id, share_amount=Decimal("75.00"), share_percentage=33.33))

        db.commit()

        # Chat Messages for Trip 1
        print("[INFO] Seeding Real-Time Chat messages...")
        chat_msgs = [
            ChatMessage(
                trip_id=trip1.id, user_id=u1.id,
                message="Hey team! I just finished putting together our 7-day Tokyo itinerary. Take a look at the map and let me know your thoughts!",
                created_at=now - timedelta(hours=5),
                reactions={"🔥": [u2.id, u4.id], "❤️": [u2.id]}
            ),
            ChatMessage(
                trip_id=trip1.id, user_id=u2.id,
                message="Looks incredible Alex! I grabbed our teamLab Planets tickets so we can skip the main entry queue on Day 3 🙌",
                created_at=now - timedelta(hours=4),
                reactions={"🙌": [u1.id]}
            ),
            ChatMessage(
                trip_id=trip1.id, user_id=u4.id,
                message="Awesome! I've added a few cocktail lounges to recommendations in Ebisu and Shinjuku. Can't wait for the Omakase dinner!",
                created_at=now - timedelta(hours=2),
                reactions={"🍣": [u1.id, u2.id]}
            ),
            ChatMessage(
                trip_id=trip1.id, user_id=u1.id,
                message="Perfect. I also added our flight details. Background flight tracking is active so we'll get notified if any gate or delay happens.",
                created_at=now - timedelta(minutes=30),
                reactions={"✈️": [u4.id]}
            )
        ]
        db.add_all(chat_msgs)
        db.commit()

        # Notifications for User 1 (Alex)
        print("[INFO] Seeding In-App Notifications...")
        notifs = [
            Notification(
                user_id=u1.id, type=NotificationType.EXPENSE_ACTIVITY.value,
                title="New Expense Added",
                message="Elena Rostova added an expense: 'Welcome Dinner at Shinjuku Omoide Yokocho' ($225.00).",
                link_url=f"/trips/{trip1.id}?tab=expenses",
                is_read=False,
                extra_data={"trip_id": trip1.id}
            ),
            Notification(
                user_id=u1.id, type=NotificationType.TRIP_INVITATION.value,
                title="Trip Collaboration",
                message="Sarah Jenkins joined 'Tokyo Sakura & Cyberpunk Expedition' as Editor.",
                link_url=f"/trips/{trip1.id}",
                is_read=True,
                extra_data={"trip_id": trip1.id}
            ),
            Notification(
                user_id=u1.id, type=NotificationType.SYSTEM.value,
                title="Welcome to ARC-NOMAD 🧭",
                message="Your AI-powered collaborative travel engine is ready. Explore, plan itineraries, and track expenses seamlessly!",
                link_url="/dashboard",
                is_read=True
            )
        ]
        db.add_all(notifs)
        db.commit()

        # Trip 2: Amalfi Coast & Rome Renaissance (Upcoming & Fully Planned)
        start_t2 = now + timedelta(days=20)
        end_t2 = start_t2 + timedelta(days=5)

        trip2 = Trip(
            title="Amalfi Coast & Rome Renaissance",
            description="A curated 6-day Italian voyage spanning Rome's ancient architectural wonders, cliffside pastel villages of Positano, and sunset private yacht sailing along Capri.",
            destination="Rome, Italy",
            destination_lat=41.9028,
            destination_lng=12.4964,
            start_date=start_t2,
            end_date=end_t2,
            budget=Decimal("4200.00"),
            currency="EUR",
            cover_image="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
            status=TripStatus.PLANNING.value,
            owner_id=u1.id
        )
        db.add(trip2)
        db.commit()
        db.refresh(trip2)

        m2_1 = TripMember(trip_id=trip2.id, user_id=u1.id, role=TripRole.OWNER.value)
        m2_2 = TripMember(trip_id=trip2.id, user_id=u2.id, role=TripRole.EDITOR.value)
        m2_3 = TripMember(trip_id=trip2.id, user_id=u3.id, role=TripRole.EXPENSE_MANAGER.value)
        db.add_all([m2_1, m2_2, m2_3])
        db.commit()

        # Trip 2 Itinerary Days
        print("[INFO] Seeding Day-by-Day Itinerary for Trip 2 (Rome & Amalfi Coast)...")
        t2_d1 = ItineraryDay(trip_id=trip2.id, day_number=1, date=start_t2, notes="Arrival at Rome FCO, Trastevere cobblestone evening & authentic carbonara.")
        t2_d2 = ItineraryDay(trip_id=trip2.id, day_number=2, date=start_t2 + timedelta(days=1), notes="Colosseum underground tour, Roman Forum, Trevi Fountain at night.")
        t2_d3 = ItineraryDay(trip_id=trip2.id, day_number=3, date=start_t2 + timedelta(days=2), notes="Vatican Museums, Sistine Chapel & St. Peter's Basilica dome climb.")
        t2_d4 = ItineraryDay(trip_id=trip2.id, day_number=4, date=start_t2 + timedelta(days=3), notes="High-speed Frecciarossa train to Naples, coastal drive to Positano.")
        t2_d5 = ItineraryDay(trip_id=trip2.id, day_number=5, date=start_t2 + timedelta(days=4), notes="Private Capri island yacht charter, Blue Grotto & Faraglioni rocks.")
        t2_d6 = ItineraryDay(trip_id=trip2.id, day_number=6, date=start_t2 + timedelta(days=5), notes="Ravello cliffside gardens, Villa Cimbrone & farewell limoncello tasting.")
        db.add_all([t2_d1, t2_d2, t2_d3, t2_d4, t2_d5, t2_d6])
        db.commit()
        db.refresh(t2_d1); db.refresh(t2_d2); db.refresh(t2_d3); db.refresh(t2_d4); db.refresh(t2_d5); db.refresh(t2_d6)

        t2_items = [
            # Day 1
            ItineraryItem(
                day_id=t2_d1.id, trip_id=trip2.id, title="Rome Fiumicino Touchdown & Leonardo Express",
                description="Arrive at FCO Terminal 3. Board the non-stop Leonardo Express train to Roma Termini.",
                location_name="Rome Fiumicino Airport (FCO)", address="Via dell' Aeroporto di Fiumicino, 00054 Fiumicino RM",
                latitude=41.8003, longitude=12.2389, start_time="11:30", end_time="13:00",
                category="TRANSPORT", estimated_cost=Decimal("14.00"), order_index=0, notes="Train tickets validated on platform."
            ),
            ItineraryItem(
                day_id=t2_d1.id, trip_id=trip2.id, title="Check-in at Hotel Raphael Relais & Châteaux",
                description="Boutique ivy-clad hotel steps from Piazza Navona featuring a breathtaking panoramic rooftop terrace.",
                location_name="Hotel Raphael", address="Largo Febo 2, 00186 Roma RM",
                latitude=41.9006, longitude=12.4716, start_time="14:00", end_time="15:00",
                category="HOTEL", estimated_cost=Decimal("0.00"), order_index=1, notes="Terrace sunset drink reservations confirmed."
            ),
            ItineraryItem(
                day_id=t2_d1.id, trip_id=trip2.id, title="Trastevere Artisan Alleys & Da Enzo al 29 Dinner",
                description="Cobblestone stroll through bohemian Trastevere followed by legendary handmade tonnarelli cacio e pepe.",
                location_name="Da Enzo al 29", address="Via dei Vascellari 29, 00153 Roma RM",
                latitude=41.8885, longitude=12.4786, start_time="19:30", end_time="22:00",
                category="FOOD", estimated_cost=Decimal("45.00"), order_index=2, notes="No reservations accepted; arrive 15 mins prior to opening."
            ),
            # Day 2
            ItineraryItem(
                day_id=t2_d2.id, trip_id=trip2.id, title="Colosseum Arena Floor & Underground Chambers",
                description="VIP skip-the-line guided access to the gladiators' underground tunnels and reconstructed arena floor.",
                location_name="The Colosseum", address="Piazza del Colosseo 1, 00184 Roma RM",
                latitude=41.8902, longitude=12.4922, start_time="09:00", end_time="12:00",
                category="SIGHTSEEING", estimated_cost=Decimal("38.00"), order_index=0, notes="Passport ID required at the gate."
            ),
            ItineraryItem(
                day_id=t2_d2.id, trip_id=trip2.id, title="Palatine Hill & Roman Forum Archaeological Walk",
                description="Explore the imperial palaces of emperors and the historic civic center of ancient Rome.",
                location_name="Roman Forum", address="Via della Salara Vecchia 5/6, 00186 Roma RM",
                latitude=41.8925, longitude=12.4853, start_time="12:30", end_time="14:30",
                category="SIGHTSEEING", estimated_cost=Decimal("0.00"), order_index=1, notes="Combo ticket with Colosseum."
            ),
            ItineraryItem(
                day_id=t2_d2.id, trip_id=trip2.id, title="Trevi Fountain by Night & Artisan Gelato",
                description="Toss a coin into Bernini's illuminated Baroque fountain and savor pistachio gelato at Giolitti.",
                location_name="Trevi Fountain", address="Piazza di Trevi, 00187 Roma RM",
                latitude=41.9009, longitude=12.4833, start_time="20:30", end_time="22:00",
                category="SIGHTSEEING", estimated_cost=Decimal("8.00"), order_index=2, notes="Throw coin with right hand over left shoulder."
            ),
            # Day 3
            ItineraryItem(
                day_id=t2_d3.id, trip_id=trip2.id, title="Vatican Museums & Sistine Chapel Private Tour",
                description="Early access viewing of Michelangelo's ceiling frescoes and the Gallery of Maps before general public entry.",
                location_name="Vatican Museums", address="Viale Vaticano, 00165 Roma RM",
                latitude=41.9065, longitude=12.4536, start_time="08:30", end_time="12:00",
                category="SIGHTSEEING", estimated_cost=Decimal("45.00"), order_index=0, notes="Strict dress code: shoulders and knees covered."
            ),
            ItineraryItem(
                day_id=t2_d3.id, trip_id=trip2.id, title="St. Peter's Basilica Dome Panorama Climb",
                description="Climb 551 steps to the top of Michelangelo's dome for 360-degree vistas across St. Peter's Square and the Vatican Gardens.",
                location_name="St. Peter's Basilica", address="Piazza San Pietro, 00120 Città del Vaticano",
                latitude=41.9022, longitude=12.4539, start_time="13:30", end_time="15:30",
                category="ACTIVITY", estimated_cost=Decimal("10.00"), order_index=1, notes="Elevator option takes you halfway."
            ),
            # Day 4
            ItineraryItem(
                day_id=t2_d4.id, trip_id=trip2.id, title="Frecciarossa High-Speed Rail & Amalfi Coastline Transfer",
                description="Executive class train to Napoli Centrale, then private Mercedes coastal transfer along cliffside curves to Positano.",
                location_name="Napoli Centrale to Positano", address="Piazza Giuseppe Garibaldi, 80142 Napoli NA",
                latitude=40.8529, longitude=14.2721, start_time="09:15", end_time="12:30",
                category="TRANSPORT", estimated_cost=Decimal("75.00"), order_index=0, notes="Window seats on the right side for coastal panoramas."
            ),
            ItineraryItem(
                day_id=t2_d4.id, trip_id=trip2.id, title="Check-in at Le Sirenuse Positano",
                description="Legendary cliffside luxury resort overlooking the pastel cascades of Positano and Mediterranean bay.",
                location_name="Le Sirenuse Positano", address="Via Cristoforo Colombo 30, 84017 Positano SA",
                latitude=40.6288, longitude=14.4862, start_time="13:00", end_time="14:30",
                category="HOTEL", estimated_cost=Decimal("0.00"), order_index=1, notes="Room with private bougainvillea balcony."
            ),
            ItineraryItem(
                day_id=t2_d4.id, trip_id=trip2.id, title="Franco's Bar Sunset Cocktails & Seafood Dinner",
                description="Al fresco cliffside cocktails watching pastel buildings glow in the Mediterranean twilight.",
                location_name="Franco's Bar", address="Via Cristoforo Colombo 30, 84017 Positano SA",
                latitude=40.6289, longitude=14.4860, start_time="18:30", end_time="21:30",
                category="FOOD", estimated_cost=Decimal("90.00"), order_index=2, notes="Signature Amalfi Lemon Spritz."
            ),
            # Day 5
            ItineraryItem(
                day_id=t2_d5.id, trip_id=trip2.id, title="Capri Island Private Yacht Charter & Faraglioni Passage",
                description="Sail past the dramatic Faraglioni sea stacks, swim in emerald grottos, and dock at Marina Grande Capri.",
                location_name="Marina Grande Capri", address="Marina Grande, 80073 Capri NA",
                latitude=40.5562, longitude=14.2407, start_time="10:00", end_time="17:00",
                category="ACTIVITY", estimated_cost=Decimal("220.00"), order_index=0, notes="Includes snorkeling gear and prosecco on deck."
            ),
            # Day 6
            ItineraryItem(
                day_id=t2_d6.id, trip_id=trip2.id, title="Ravello Cliffside Walk & Villa Cimbrone Infinity Terrace",
                description="Perched 350 meters above the sea, walk the world-famous 'Terrace of Infinity' adorned with marble Roman busts.",
                location_name="Villa Cimbrone", address="Via Santa Chiara 26, 84010 Ravello SA",
                latitude=40.6455, longitude=14.6110, start_time="10:30", end_time="13:30",
                category="SIGHTSEEING", estimated_cost=Decimal("12.00"), order_index=0, notes="Spectacular panoramic photography viewpoint."
            )
        ]
        db.add_all(t2_items)
        db.commit()

        # Flights for Trip 2
        print("[INFO] Seeding Flights for Trip 2...")
        f2_1 = Flight(
            trip_id=trip2.id,
            user_id=u1.id,
            airline="ITA Airways",
            flight_number="AZ611",
            departure_airport="JFK",
            arrival_airport="FCO",
            departure_city="New York",
            arrival_city="Rome",
            departure_time=start_t2 - timedelta(hours=9),
            arrival_time=start_t2,
            terminal="T1",
            gate="E22",
            status=FlightStatus.SCHEDULED.value,
            seat="03A",
            booking_reference="AZ-9028114",
            notes="Business Class Flatbed. Wine pairing requested."
        )
        f2_2 = Flight(
            trip_id=trip2.id,
            user_id=u3.id,
            airline="Lufthansa",
            flight_number="LH232",
            departure_airport="FRA",
            arrival_airport="FCO",
            departure_city="Frankfurt",
            arrival_city="Rome",
            departure_time=start_t2 - timedelta(hours=4),
            arrival_time=start_t2 - timedelta(hours=2),
            terminal="T3",
            gate="B09",
            status=FlightStatus.SCHEDULED.value,
            seat="14C",
            booking_reference="LH-771920",
            notes="Euro connector flight."
        )
        db.add_all([f2_1, f2_2])
        db.commit()

        # Bookings for Trip 2
        print("[INFO] Seeding Bookings for Trip 2...")
        b2_1 = Booking(
            trip_id=trip2.id,
            user_id=u1.id,
            booking_type="HOTEL",
            title="Hotel Raphael Relais & Châteaux Rome",
            confirmation_code="ARC-HTL-8910",
            status="CONFIRMED",
            start_date=start_t2,
            end_date=start_t2 + timedelta(days=3),
            party_size=2,
            total_price=1140.0,
            currency="EUR",
            address="Largo Febo 2, 00186 Roma RM, Italy",
            phone_or_contact="+39 06 682831",
            special_requests="High floor overlooking Santa Maria della Pace",
            details={"room_type": "Executive Suite", "amenities": ["Rooftop terrace", "Free Wi-Fi", "Marble Bath"]}
        )
        b2_2 = Booking(
            trip_id=trip2.id,
            user_id=u1.id,
            booking_type="RESTAURANT",
            title="La Pergola Rome (3-Star Michelin)",
            confirmation_code="ARC-RES-4019",
            status="CONFIRMED",
            start_date=start_t2 + timedelta(days=2),
            time_slot="20:00",
            party_size=3,
            total_price=650.0,
            currency="EUR",
            address="Via Alberto Cadlolo 101, 00136 Roma RM, Italy",
            phone_or_contact="+39 06 3509 2152",
            special_requests="Window table overlooking St. Peter's Dome",
            details={"cuisine": "Contemporary Italian", "dress_code": "Jacket required"}
        )
        db.add_all([b2_1, b2_2])
        db.commit()

        # Recommendations for Trip 2
        print("[INFO] Seeding Recommendations for Trip 2...")
        recs2 = [
            Recommendation(
                trip_id=trip2.id, name="Roscioli Salumeria con Cucina",
                category="Restaurants", description="Legendary culinary institution renowned for aged Parmigiano, culatello ham, and world-class carbonara.",
                rating=4.9, price_level="$$$", address="Via dei Giubbonari 21, 00186 Roma RM",
                latitude=41.8943, longitude=12.4740, reason="Essential authentic dining experience near Campo de' Fiori.",
                tags=["Carbonara", "Wine Cellar", "Historic"], is_saved=True
            ),
            Recommendation(
                trip_id=trip2.id, name="Path of the Gods (Sentiero degli Dei)",
                category="Attractions", description="Breathtaking mountain cliff hiking trail suspended between heaven and the Amalfi coastline.",
                rating=4.9, price_level="$", address="Bomerano to Nocelle, Amalfi Coast",
                latitude=40.6300, longitude=14.5300, reason="Unrivaled Mediterranean panoramas for trekking enthusiasts.",
                tags=["Hiking", "Scenic Views", "Outdoors"], is_saved=True
            ),
            Recommendation(
                trip_id=trip2.id, name="Salotto 42 (Piazza di Pietra Bar)",
                category="Nightlife", description="Chic book bar set right against the towering marble pillars of the 2nd-century Temple of Hadrian.",
                rating=4.7, price_level="$$$", address="Piazza di Pietra 42, 00186 Roma RM",
                latitude=41.8998, longitude=12.4795, reason="Aperitivo with direct view of ancient Roman imperial columns.",
                tags=["Aperitivo", "Cocktails", "Temple Views"], is_saved=True
            )
        ]
        db.add_all(recs2)
        db.commit()

        # Expenses for Trip 2
        print("[INFO] Seeding Expenses for Trip 2...")
        exp2_1 = Expense(
            trip_id=trip2.id, paid_by_user_id=u1.id, amount=Decimal("450.00"), currency="EUR",
            category=ExpenseCategory.ACTIVITIES.value, description="Private Capri Yacht Charter & Skipper Deposit",
            expense_date=now - timedelta(days=1), split_type=SplitType.EQUAL.value, notes="Shared across Alex, Sarah, and Marco."
        )
        db.add(exp2_1)
        db.flush()
        for u in [u1, u2, u3]:
            db.add(ExpenseParticipant(expense_id=exp2_1.id, user_id=u.id, share_amount=Decimal("150.00")))
        db.commit()

        # Trip 2 Group Chat Messages
        print("[INFO] Seeding Chat Messages for Trip 2...")
        t2_chat = [
            ChatMessage(
                trip_id=trip2.id, user_id=u1.id,
                message="Ciao everyone! The Rome & Amalfi Coast plan is locked in. Private Capri yacht charter is booked! 🚤🍋",
                message_type="TEXT"
            ),
            ChatMessage(
                trip_id=trip2.id, user_id=u3.id,
                message="Incredible! I've confirmed our underground Colosseum passes and Frecciarossa tickets as well.",
                message_type="TEXT",
                reactions={"🏛️": [u1.id, u2.id]}
            )
        ]
        db.add_all(t2_chat)
        db.commit()

        print("[SUCCESS] Database seed completed successfully with 2 fully-planned demo trips!")
        print("Demo User 1: alex_nomad (password: password123)")
        print("Demo User 2: sarah_voyage (password: password123)")
        print("Demo User 3: marco_explorer (password: password123)")
        print("Demo User 4: elena_wander (password: password123)")

    except Exception as e:
        print(f"[ERROR] Error seeding database: {e}")
        db.rollback()
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

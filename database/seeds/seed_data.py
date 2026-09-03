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
                title="Welcome to ARC-NOMADE 🧭",
                message="Your AI-powered collaborative travel engine is ready. Explore, plan itineraries, and track expenses seamlessly!",
                link_url="/dashboard",
                is_read=True
            )
        ]
        db.add_all(notifs)
        db.commit()

        # Trip 2: Amalfi Coast & Rome Renaissance (Upcoming)
        trip2 = Trip(
            title="Amalfi Coast & Rome Renaissance",
            description="5 days exploring ancient Roman ruins, cliffside pastel villages of Positano, and sunset sailing along Capri.",
            destination="Rome, Italy",
            destination_lat=41.9028,
            destination_lng=12.4964,
            start_date=now + timedelta(days=25),
            end_date=now + timedelta(days=30),
            budget=Decimal("3800.00"),
            currency="EUR",
            cover_image="https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1200&q=80",
            status=TripStatus.PLANNING.value,
            owner_id=u1.id
        )
        db.add(trip2)
        db.commit()
        db.refresh(trip2)

        m2_1 = TripMember(trip_id=trip2.id, user_id=u1.id, role=TripRole.OWNER.value)
        m2_2 = TripMember(trip_id=trip2.id, user_id=u3.id, role=TripRole.EDITOR.value)
        db.add_all([m2_1, m2_2])
        db.commit()

        # Trip 3: Swiss Alps Winter Glacier Trek (Completed)
        trip3 = Trip(
            title="Swiss Alps Winter Glacier Trek",
            description="Scenic mountain cogwheel railways, snowshoe glacier expeditions, and fondue fireside evenings in Zermatt.",
            destination="Zermatt, Switzerland",
            destination_lat=45.9765,
            destination_lng=7.7491,
            start_date=now - timedelta(days=60),
            end_date=now - timedelta(days=55),
            budget=Decimal("3200.00"),
            currency="USD",
            cover_image="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1200&q=80",
            status=TripStatus.COMPLETED.value,
            owner_id=u1.id
        )
        db.add(trip3)
        db.commit()
        db.refresh(trip3)

        m3_1 = TripMember(trip_id=trip3.id, user_id=u1.id, role=TripRole.OWNER.value)
        m3_2 = TripMember(trip_id=trip3.id, user_id=u2.id, role=TripRole.VIEWER.value)
        db.add_all([m3_1, m3_2])
        db.commit()

        print("[SUCCESS] Database seed completed successfully!")
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

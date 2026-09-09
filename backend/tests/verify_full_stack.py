import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def test_endpoint(name, url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    if data:
        data_bytes = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    else:
        data_bytes = None

    req = urllib.request.Request(url, data=data_bytes, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            status = response.status
            body = response.read()
            print(f"[{status}] {name} - OK ({len(body)} bytes)")
            try:
                return json.loads(body.decode("utf-8"))
            except Exception:
                return body
    except urllib.error.HTTPError as e:
        print(f"[HTTP {e.code}] {name} - ERROR: {e.read().decode('utf-8')}")
        raise
    except Exception as e:
        print(f"[FAIL] {name} - {e}")
        raise

def main():
    print("========================================")
    print("ARC-NOMADE END-TO-END VERIFICATION SUITE")
    print("========================================")

    # 1. Test Next.js Frontend Server
    test_endpoint("Next.js Landing Page", "http://127.0.0.1:3000/")

    # 2. Test FastAPI Backend Demo Auth
    auth_data = test_endpoint("Backend Demo Login (Alex)", "http://127.0.0.1:8000/api/v1/auth/demo-login?username=alex_nomad", method="POST")
    token = auth_data["access_token"]
    auth_header = {"Authorization": f"Bearer {token}"}

    # 3. Test User Profile
    user = test_endpoint("User Me Profile", "http://127.0.0.1:8000/api/v1/auth/me", headers=auth_header)
    print(f"   -> Logged in as: {user['full_name']} (@{user['username']})")

    # 4. Test Trips List
    trips = test_endpoint("List Trips", "http://127.0.0.1:8000/api/v1/trips/", headers=auth_header)
    print(f"   -> Retrieved {len(trips)} trips.")
    tokyo_trip = next((t for t in trips if "Tokyo" in t["title"]), trips[0])
    trip_id = tokyo_trip["id"]
    print(f"   -> Testing Trip: {tokyo_trip['title']} ({trip_id})")

    # 5. Test Live Weather
    weather = test_endpoint("Destination Weather", f"http://127.0.0.1:8000/api/v1/trips/{trip_id}/weather", headers=auth_header)
    print(f"   -> Weather: {weather['temperature']}C, {weather['condition']}, humidity {weather['humidity']}%")

    # 6. Test Itinerary Days & Items
    days = test_endpoint("Itinerary Days", f"http://127.0.0.1:8000/api/v1/itinerary/{trip_id}/days", headers=auth_header)
    total_items = sum(len(d.get("items", [])) for d in days)
    print(f"   -> {len(days)} itinerary days, {total_items} activities scheduled.")

    # 7. Test AI Recommendations
    recs = test_endpoint("AI Recommendations", f"http://127.0.0.1:8000/api/v1/recommendations/{trip_id}", headers=auth_header)
    print(f"   -> {len(recs)} curated spots available.")

    # 8. Test Flights & Flight Simulation
    flights = test_endpoint("Trip Flights", f"http://127.0.0.1:8000/api/v1/flights/{trip_id}", headers=auth_header)
    print(f"   -> {len(flights)} flights tracked.")
    if flights:
        f_id = flights[0]["id"]
        sim_res = test_endpoint(
            "Simulate Flight Status Event",
            f"http://127.0.0.1:8000/api/v1/flights/{f_id}/simulate-status",
            method="POST",
            data={"new_status": "DELAYED", "delay_minutes": 35, "gate": "A12"},
            headers=auth_header
        )
        print(f"   -> Flight updated to status: {sim_res['status']} with gate {sim_res.get('gate')}")

    # 9. Test Expense Splitting & Analytics
    analytics = test_endpoint("Expense Analytics & Debt Settlements", f"http://127.0.0.1:8000/api/v1/expenses/{trip_id}/analytics", headers=auth_header)
    print(f"   -> Total Spent: {analytics['currency']} {analytics['total_spent']}, Budget: {analytics['trip_budget']}")
    print(f"   -> Categories: {[c['category'] for c in analytics['spending_by_category']]}")
    print(f"   -> Suggested Settlements: {len(analytics['suggested_settlements'])} minimum cash-flow transactions.")

    # 10. Test PDF & Excel Exports
    pdf_bytes = test_endpoint("ReportLab PDF Export", f"http://127.0.0.1:8000/api/v1/exports/{trip_id}/pdf", headers=auth_header)
    print(f"   -> PDF generated successfully ({len(pdf_bytes)} bytes).")

    excel_bytes = test_endpoint("openpyxl Excel Export", f"http://127.0.0.1:8000/api/v1/exports/{trip_id}/excel", headers=auth_header)
    print(f"   -> Excel generated successfully ({len(excel_bytes)} bytes).")

    # 11. Test Notifications
    notifs = test_endpoint("Notifications List", "http://127.0.0.1:8000/api/v1/notifications/", headers=auth_header)
    print(f"   -> {len(notifs)} notifications in queue (including recent flight delay alert).")

    # 12. Test Friends List
    friends = test_endpoint("Friends List", "http://127.0.0.1:8000/api/v1/friends/", headers=auth_header)
    print(f"   -> {len(friends)} friends in traveler network.")

    # 13. Test Hotel Catalog Browsing
    hotels = test_endpoint("Browse Hotel Catalog (Tokyo)", f"http://127.0.0.1:8000/api/v1/catalog/hotels?destination=Tokyo", headers=auth_header)
    print(f"   -> Retrieved {len(hotels)} curated hotel accommodations in Tokyo.")
    assert len(hotels) >= 2
    target_hotel = hotels[0]
    print(f"   -> Selected: {target_hotel['name']} ({target_hotel['tier']}) - ${target_hotel['price_per_night']}/night")

    # 14. Test Restaurant Catalog Browsing
    restaurants = test_endpoint("Browse Restaurant Catalog (Tokyo)", f"http://127.0.0.1:8000/api/v1/catalog/restaurants?destination=Tokyo", headers=auth_header)
    print(f"   -> Retrieved {len(restaurants)} culinary venues in Tokyo.")
    assert len(restaurants) >= 2
    target_restaurant = restaurants[0]
    print(f"   -> Selected: {target_restaurant['name']} ({target_restaurant['cuisine']}) - {target_restaurant['price_tier']}")

    # 15. Create Confirmed Hotel Booking (with Itinerary Sync)
    hotel_booking_payload = {
        "trip_id": trip_id,
        "booking_type": "HOTEL",
        "title": target_hotel["name"],
        "start_date": "2026-10-10T15:00:00Z",
        "end_date": "2026-10-15T11:00:00Z",
        "time_slot": "15:00 Check-in",
        "party_size": 2,
        "total_price": float(target_hotel["price_per_night"] * 5),
        "currency": target_hotel["currency"],
        "address": target_hotel["address"],
        "special_requests": "Upper floor corner room with Mount Fuji view",
        "details": {"room_type": target_hotel["room_types"][0]["name"], "neighborhood": target_hotel["neighborhood"]},
        "add_to_itinerary": True
    }
    htl_booking = test_endpoint(
        "Create Hotel Reservation",
        f"http://127.0.0.1:8000/api/v1/trips/{trip_id}/bookings",
        method="POST",
        data=hotel_booking_payload,
        headers=auth_header
    )
    print(f"   -> Stay Confirmed! Code: {htl_booking['confirmation_code']}, Status: {htl_booking['status']}")
    assert htl_booking["confirmation_code"].startswith("ARC-HTL-")

    # 16. Create Confirmed Restaurant Table Reservation (with Itinerary Sync)
    res_booking_payload = {
        "trip_id": trip_id,
        "booking_type": "RESTAURANT",
        "title": target_restaurant["name"],
        "start_date": "2026-10-12T19:30:00Z",
        "time_slot": target_restaurant["available_times"][0],
        "party_size": 2,
        "total_price": None,
        "currency": "USD",
        "address": target_restaurant["address"],
        "special_requests": "Anniversary celebration table",
        "details": {"cuisine": target_restaurant["cuisine"], "vibe": target_restaurant["vibe"]},
        "add_to_itinerary": True
    }
    rest_booking = test_endpoint(
        "Create Dining Table Reservation",
        f"http://127.0.0.1:8000/api/v1/trips/{trip_id}/bookings",
        method="POST",
        data=res_booking_payload,
        headers=auth_header
    )
    print(f"   -> Table Confirmed! Code: {rest_booking['confirmation_code']}, Status: {rest_booking['status']}")
    assert rest_booking["confirmation_code"].startswith("ARC-RES-")

    # 17. Verify Active Reservations Ledger
    trip_bookings = test_endpoint("Retrieve Trip Bookings Ledger", f"http://127.0.0.1:8000/api/v1/trips/{trip_id}/bookings", headers=auth_header)
    print(f"   -> Active Ledger Count: {len(trip_bookings)} confirmed reservations.")
    assert any(b["confirmation_code"] == htl_booking["confirmation_code"] for b in trip_bookings)
    assert any(b["confirmation_code"] == rest_booking["confirmation_code"] for b in trip_bookings)

    # 18. Verify Synchronization in Day Planner Itinerary
    updated_days = test_endpoint("Verify Itinerary Day Planner Synchronization", f"http://127.0.0.1:8000/api/v1/itinerary/{trip_id}/days", headers=auth_header)
    all_stops = [item["title"] for d in updated_days for item in d.get("items", [])]
    print(f"   -> Day Planner updated activities: {len(all_stops)} total stops.")
    assert any(target_hotel["name"] in stop for stop in all_stops), "Hotel reservation stop missing from Day Planner!"
    assert any(target_restaurant["name"] in stop for stop in all_stops), "Restaurant reservation stop missing from Day Planner!"
    print(f"   -> Synced Stops Verified: Hotel check-in & Dining reservation present in daily timetable.")

    print("\n========================================")
    print("ALL 18 END-TO-END VALIDATIONS PASSED! [SUCCESS]")
    print("========================================")

if __name__ == "__main__":
    main()


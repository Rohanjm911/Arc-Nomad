from datetime import datetime, timedelta, timezone

def test_bookings_and_catalog(client, auth_headers):
    # 1. Test Hotel Catalog
    hotels_res = client.get("/api/v1/catalog/hotels", headers=auth_headers)
    assert hotels_res.status_code == 200
    hotels = hotels_res.json()
    assert len(hotels) > 0
    assert any("Tokyo" in h["destination"] for h in hotels)

    # Destination-specific hotel query
    tokyo_hotels = client.get("/api/v1/catalog/hotels?destination=Tokyo", headers=auth_headers).json()
    assert len(tokyo_hotels) >= 2
    assert "Park Hyatt Tokyo" in [h["name"] for h in tokyo_hotels]

    # Dynamic fallback query
    sydney_hotels = client.get("/api/v1/catalog/hotels?destination=Sydney", headers=auth_headers).json()
    assert len(sydney_hotels) >= 1
    assert "Sydney" in sydney_hotels[0]["destination"]

    # 2. Test Restaurant Catalog
    rest_res = client.get("/api/v1/catalog/restaurants", headers=auth_headers)
    assert rest_res.status_code == 200
    restaurants = rest_res.json()
    assert len(restaurants) > 0

    paris_rest = client.get("/api/v1/catalog/restaurants?destination=Paris", headers=auth_headers).json()
    assert len(paris_rest) >= 2
    assert any("Septime" in r["name"] for r in paris_rest)

    # 3. Create a Trip to hold bookings
    start = (datetime.now(timezone.utc) + timedelta(days=20)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=25)).isoformat()
    trip_res = client.post("/api/v1/trips/", json={
        "title": "Tokyo Culinary & Stays",
        "destination": "Tokyo, Japan",
        "start_date": start,
        "end_date": end,
        "budget": 4000.0,
        "currency": "USD"
    }, headers=auth_headers)
    assert trip_res.status_code == 201
    trip_id = trip_res.json()["id"]

    # 4. Create Hotel Booking with Itinerary Integration
    hotel_payload = {
        "trip_id": trip_id,
        "booking_type": "HOTEL",
        "title": "Park Hyatt Tokyo",
        "start_date": start,
        "end_date": end,
        "time_slot": "15:00",
        "party_size": 2,
        "total_price": 2700.0,
        "currency": "USD",
        "address": "3-7-1-2 Nishi-Shinjuku, Tokyo",
        "special_requests": "High floor corner room with Fuji view",
        "details": {"room_type": "Park View King", "amenities": ["Peak Lounge", "Spa"]},
        "add_to_itinerary": True
    }
    create_htl_res = client.post(f"/api/v1/trips/{trip_id}/bookings", json=hotel_payload, headers=auth_headers)
    assert create_htl_res.status_code == 201
    htl_data = create_htl_res.json()
    assert htl_data["booking_type"] == "HOTEL"
    assert htl_data["status"] == "CONFIRMED"
    assert htl_data["confirmation_code"].startswith("ARC-HTL-")
    htl_id = htl_data["id"]

    # 5. Create Restaurant Table Reservation
    res_payload = {
        "trip_id": trip_id,
        "booking_type": "RESTAURANT",
        "title": "Narisawa",
        "start_date": start,
        "time_slot": "19:30",
        "party_size": 2,
        "total_price": 380.0,
        "currency": "USD",
        "address": "Minami-Aoyama, Tokyo",
        "special_requests": "Chef's counter seating preferred",
        "details": {"cuisine": "Modern Japanese", "dietary": "No Shellfish"},
        "add_to_itinerary": True
    }
    create_res_res = client.post(f"/api/v1/trips/{trip_id}/bookings", json=res_payload, headers=auth_headers)
    assert create_res_res.status_code == 201
    res_data = create_res_res.json()
    assert res_data["booking_type"] == "RESTAURANT"
    assert res_data["confirmation_code"].startswith("ARC-RES-")
    res_id = res_data["id"]

    # 6. Fetch Bookings for Trip
    get_bookings_res = client.get(f"/api/v1/trips/{trip_id}/bookings", headers=auth_headers)
    assert get_bookings_res.status_code == 200
    all_bookings = get_bookings_res.json()
    assert len(all_bookings) == 2

    # Verify itinerary item was created
    itin_res = client.get(f"/api/v1/itinerary/{trip_id}/days", headers=auth_headers)
    assert itin_res.status_code == 200
    itin_days = itin_res.json()
    assert len(itin_days) >= 1
    day_items = itin_days[0]["items"]
    assert len(day_items) >= 2
    assert any("Park Hyatt Tokyo" in item["title"] for item in day_items)
    assert any("Narisawa" in item["title"] for item in day_items)

    # 7. Test Nearby Hotels & Dining Recommendations based on Itinerary Tourist Spots
    # Add coordinates to the created itinerary item
    itin_item = day_items[0]
    # Fetch nearby hotels for trip
    nearby_htl_res = client.get(f"/api/v1/catalog/hotels/nearby?trip_id={trip_id}", headers=auth_headers)
    assert nearby_htl_res.status_code == 200
    # Fetch nearby restaurants for trip
    nearby_rest_res = client.get(f"/api/v1/catalog/restaurants/nearby?trip_id={trip_id}", headers=auth_headers)
    assert nearby_rest_res.status_code == 200

    # 8. Cancel / Delete Booking
    del_res = client.delete(f"/api/v1/trips/{trip_id}/bookings/{htl_id}", headers=auth_headers)
    assert del_res.status_code == 200
    
    # Confirm deletion
    remaining_res = client.get(f"/api/v1/trips/{trip_id}/bookings", headers=auth_headers)
    assert len(remaining_res.json()) == 1
    assert remaining_res.json()[0]["id"] == res_id

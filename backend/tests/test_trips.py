from datetime import datetime, timedelta, timezone

def test_trip_lifecycle(client, auth_headers):
    start = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()

    trip_payload = {
        "title": "Kyoto Zen Gardens",
        "description": "Temples and bamboo groves",
        "destination": "Kyoto, Japan",
        "start_date": start,
        "end_date": end,
        "budget": 2500.0,
        "currency": "USD"
    }

    # Create trip
    res = client.post("/api/v1/trips/", json=trip_payload, headers=auth_headers)
    assert res.status_code == 201
    trip_data = res.json()
    trip_id = trip_data["id"]
    assert trip_data["title"] == "Kyoto Zen Gardens"
    assert trip_data["user_role"] == "OWNER"

    # Get trip
    get_res = client.get(f"/api/v1/trips/{trip_id}", headers=auth_headers)
    assert get_res.status_code == 200
    assert len(get_res.json()["members"]) >= 1

    # Update trip
    update_res = client.put(f"/api/v1/trips/{trip_id}", json={"budget": 3000.0}, headers=auth_headers)
    assert update_res.status_code == 200
    assert float(update_res.json()["budget"]) == 3000.0

    # Test Geocoding Endpoint
    geo_res = client.get("/api/v1/trips/geocode?query=Barcelona", headers=auth_headers)
    assert geo_res.status_code == 200
    geo_data = geo_res.json()
    assert len(geo_data) > 0
    assert "latitude" in geo_data[0]
    assert "longitude" in geo_data[0]
    assert abs(geo_data[0]["latitude"] - 41.38) < 1.0

    # Test Create Itinerary Day without trip_id in body (path parameter used)
    day_res = client.post(
        f"/api/v1/itinerary/{trip_id}/days",
        json={"day_number": 1, "notes": "Day 1 explorations in Kyoto"},
        headers=auth_headers
    )
    assert day_res.status_code == 201
    assert day_res.json()["day_number"] == 1
    assert day_res.json()["trip_id"] == trip_id



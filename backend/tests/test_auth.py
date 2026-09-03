def test_register_and_login(client):
    reg_payload = {
        "email": "newexplorer@arcnomad.com",
        "username": "new_explorer",
        "password": "strongpassword123",
        "full_name": "New Explorer",
        "travel_interests": ["Hiking", "Culture"],
        "travel_style": "Adventure",
        "budget_preference": "Moderate"
    }
    res = client.post("/api/v1/auth/register", json=reg_payload)
    assert res.status_code == 201
    data = res.json()
    assert "access_token" in data
    assert data["user"]["username"] == "new_explorer"

    # Login
    login_payload = {
        "email_or_username": "new_explorer",
        "password": "strongpassword123"
    }
    login_res = client.post("/api/v1/auth/login", json=login_payload)
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

def test_get_current_user_me(client, auth_headers):
    res = client.get("/api/v1/auth/me", headers=auth_headers)
    assert res.status_code == 200
    assert res.json()["username"] == "test_traveler"

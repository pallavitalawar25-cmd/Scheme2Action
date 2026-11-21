from conftest import register


def test_register_hashes_password_and_sets_http_only_cookie(client):
    response = client.post("/auth/register", json={"name": "Asha Citizen", "email": "ASHA@example.test", "username": "asha", "password": "SecurePass123!", "role": "admin"})
    assert response.status_code == 201
    assert response.json()["user"]["role"] == "citizen"
    assert "s2a_session" in response.cookies
    assert "httponly" in response.headers["set-cookie"].lower()
    assert client.get("/auth/me").json()["user"]["email"] == "asha@example.test"


def test_duplicate_email_and_invalid_password_are_rejected(client):
    register(client)
    duplicate = client.post("/auth/register", json={"name": "Another Citizen", "email": "CITIZEN@example.test", "username": "other", "password": "AnotherPass123!"})
    assert duplicate.status_code == 409 and duplicate.json()["code"] == "email_taken"
    client.post("/auth/logout")
    bad_login = client.post("/auth/login", json={"identifier": "citizen", "password": "wrong"})
    assert bad_login.status_code == 401
    assert client.get("/me/profile").status_code == 401


def test_profile_and_settings_are_authenticated_and_validated(client):
    register(client)
    response = client.patch("/me/profile", json={"fullName": "Asha Citizen", "phone": "9876543210", "pincode": "570001"})
    assert response.status_code == 200
    assert response.json()["profile"]["phone"] == "9876543210"
    invalid = client.patch("/me/profile", json={"pincode": "123"})
    assert invalid.status_code == 422
    settings = client.patch("/me/settings", json={"notifications": {"sms": True}})
    assert settings.json()["settings"]["notifications"]["sms"] is True


def test_cookie_logout_and_account_delete(client):
    register(client)
    response = client.post("/auth/logout")
    assert response.status_code == 204
    assert client.get("/auth/me").status_code == 401
    register(client, email="delete@example.test", username="delete")
    removed = client.delete("/auth/account")
    assert removed.status_code == 204
    assert client.get("/auth/me").status_code == 401


import uuid
from fastapi.testclient import TestClient

from app.core.security import (
    create_access_token,
    decode_access_token,
    hash_password,
    verify_password,
)
from app.database.init_db import init_db
from app.main import app

client = TestClient(app)


def setup_module():
    """Ensure database tables exist before testing auth APIs."""
    init_db()


def test_password_hashing_and_verification():
    raw_pwd = "SecretPassword123!"
    hashed = hash_password(raw_pwd)
    assert hashed != raw_pwd
    assert verify_password(raw_pwd, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_jwt_token_creation_and_decoding():
    subject = str(uuid.uuid4())
    token = create_access_token(subject=subject)
    decoded = decode_access_token(token)
    assert decoded is not None
    assert decoded.get("sub") == subject


def test_user_registration_and_login_flow():
    unique_id = uuid.uuid4().hex[:8]
    email = f"user_{unique_id}@darukaa.earth"
    password = "SecurePassword123"

    # 1. Register User
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    assert reg_response.status_code == 201
    data = reg_response.json()
    assert "user" in data
    assert "token" in data
    assert data["user"]["email"] == email
    assert "access_token" in data["token"]

    # 2. Duplicate registration attempt should return 400
    dup_response = client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password},
    )
    assert dup_response.status_code == 400
    assert "already registered" in dup_response.json()["detail"].lower()

    # 3. Login with valid JSON body
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"

    token = token_data["access_token"]

    # 4. Access Protected Endpoint (/me) with valid token
    me_response = client.get(
        "/api/v1/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == email

    # 5. Access Protected Endpoint without token should return 401
    unauth_response = client.get("/api/v1/auth/me")
    assert unauth_response.status_code == 401

    # 6. Login with invalid password should return 401
    invalid_login = client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": "WrongPassword!"},
    )
    assert invalid_login.status_code == 401

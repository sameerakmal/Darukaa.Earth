import uuid
from fastapi.testclient import TestClient

from app.database.init_db import init_db
from app.main import app

client = TestClient(app)


def setup_module():
    """Ensure database tables exist before testing project APIs."""
    init_db()


def create_authenticated_user(email_prefix: str = "user"):
    """Helper to register and login a test user, returning auth headers and user dict."""
    unique_email = f"{email_prefix}_{uuid.uuid4().hex[:8]}@darukaa.earth"
    password = "TestPassword123"

    reg_res = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password},
    )
    assert reg_res.status_code == 201
    data = reg_res.json()
    token = data["token"]["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    return headers, data["user"]


def test_project_crud_and_isolation():
    # User A setup
    headers_a, user_a = create_authenticated_user("usera")
    # User B setup
    headers_b, user_b = create_authenticated_user("userb")

    # 1. User A creates a project
    create_res = client.post(
        "/api/v1/projects",
        headers=headers_a,
        json={
            "name": "Amazon Carbon Sink",
            "description": "Tropical rainforest conservation",
            "project_type": "carbon",
            "status": "active",
        },
    )
    assert create_res.status_code == 201
    proj_a = create_res.json()
    assert proj_a["name"] == "Amazon Carbon Sink"
    proj_id = proj_a["id"]

    # 2. User A lists projects -> sees Amazon Carbon Sink
    list_res_a = client.get("/api/v1/projects", headers=headers_a)
    assert list_res_a.status_code == 200
    assert len(list_res_a.json()) >= 1
    assert any(p["id"] == proj_id for p in list_res_a.json())

    # 3. User B lists projects -> does NOT see User A's project
    list_res_b = client.get("/api/v1/projects", headers=headers_b)
    assert list_res_b.status_code == 200
    assert not any(p["id"] == proj_id for p in list_res_b.json())

    # 4. User B attempts to GET User A's project -> returns 404
    get_res_b = client.get(f"/api/v1/projects/{proj_id}", headers=headers_b)
    assert get_res_b.status_code == 404

    # 5. User B attempts to PUT User A's project -> returns 404
    put_res_b = client.put(
        f"/api/v1/projects/{proj_id}",
        headers=headers_b,
        json={"name": "Hacked Project Name"},
    )
    assert put_res_b.status_code == 404

    # 6. User B attempts to DELETE User A's project -> returns 404
    del_res_b = client.delete(f"/api/v1/projects/{proj_id}", headers=headers_b)
    assert del_res_b.status_code == 404

    # 7. User A updates their project
    update_res_a = client.put(
        f"/api/v1/projects/{proj_id}",
        headers=headers_a,
        json={"name": "Amazon Carbon Reserve V2", "status": "completed"},
    )
    assert update_res_a.status_code == 200
    assert update_res_a.json()["name"] == "Amazon Carbon Reserve V2"
    assert update_res_a.json()["status"] == "completed"

    # 8. User A deletes their project
    del_res_a = client.delete(f"/api/v1/projects/{proj_id}", headers=headers_a)
    assert del_res_a.status_code == 204

    # 9. GET after delete returns 404
    get_res_deleted = client.get(f"/api/v1/projects/{proj_id}", headers=headers_a)
    assert get_res_deleted.status_code == 404

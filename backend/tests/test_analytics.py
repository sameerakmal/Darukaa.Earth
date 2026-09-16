import uuid
from fastapi.testclient import TestClient

from app.database.init_db import init_db
from app.main import app

client = TestClient(app)


def setup_module():
    init_db()


def create_authenticated_user(email_prefix: str = "analytics_user"):
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


def test_site_analytics_api_and_ownership():
    headers_a, _ = create_authenticated_user("analytics_a")
    headers_b, _ = create_authenticated_user("analytics_b")

    # 1. User A creates project & site
    proj_res = client.post(
        "/api/v1/projects",
        headers=headers_a,
        json={"name": "Serengeti Migration Corridor"},
    )
    proj_id = proj_res.json()["id"]

    valid_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [34.5, -2.5],
                [34.5, -2.0],
                [35.0, -2.0],
                [35.0, -2.5],
                [34.5, -2.5],
            ]
        ],
    }

    site_res = client.post(
        f"/api/v1/projects/{proj_id}/sites",
        headers=headers_a,
        json={"name": "Sector North", "geometry": valid_polygon},
    )
    site_id = site_res.json()["id"]

    # 2. User A posts analytics data for site
    analytics_post_res = client.post(
        f"/api/v1/sites/{site_id}/analytics",
        headers=headers_a,
        json={
            "date": "2026-09-15",
            "carbon_value": 350.25,
            "biodiversity_score": 92.5,
        },
    )
    assert analytics_post_res.status_code == 201
    analytics_data = analytics_post_res.json()
    assert analytics_data["site_id"] == site_id
    assert analytics_data["carbon_value"] == 350.25
    assert analytics_data["biodiversity_score"] == 92.5

    # 3. User A lists analytics for site
    analytics_list_res = client.get(
        f"/api/v1/sites/{site_id}/analytics",
        headers=headers_a,
    )
    assert analytics_list_res.status_code == 200
    assert len(analytics_list_res.json()) == 1

    # 4. User B attempts to view or add analytics to User A's site -> returns 404
    get_res_b = client.get(
        f"/api/v1/sites/{site_id}/analytics",
        headers=headers_b,
    )
    assert get_res_b.status_code == 404

    post_res_b = client.post(
        f"/api/v1/sites/{site_id}/analytics",
        headers=headers_b,
        json={
            "carbon_value": 100.0,
            "biodiversity_score": 50.0,
        },
    )
    assert post_res_b.status_code == 404

import uuid
from fastapi.testclient import TestClient

from app.database.init_db import init_db
from app.main import app

client = TestClient(app)


def setup_module():
    init_db()


def create_authenticated_user(email_prefix: str = "siteuser"):
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


def test_site_crud_geojson_and_invalid_geometry():
    headers_a, _ = create_authenticated_user("site_a")
    headers_b, _ = create_authenticated_user("site_b")

    # 1. User A creates project
    proj_res = client.post(
        "/api/v1/projects",
        headers=headers_a,
        json={"name": "Costa Rica Biodiversity Park"},
    )
    assert proj_res.status_code == 201
    proj_id = proj_res.json()["id"]

    valid_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [-84.1, 9.9],
                [-84.1, 10.0],
                [-84.0, 10.0],
                [-84.0, 9.9],
                [-84.1, 9.9],
            ]
        ],
    }

    # 2. User A creates Site with valid GeoJSON Polygon
    site_res = client.post(
        f"/api/v1/projects/{proj_id}/sites",
        headers=headers_a,
        json={
            "name": "Monteverde Cloud Forest Zone",
            "description": "High biodiversity canopy area",
            "area": 450.0,
            "geometry": valid_polygon,
        },
    )
    assert site_res.status_code == 201
    site_data = site_res.json()
    assert site_data["name"] == "Monteverde Cloud Forest Zone"
    assert site_data["geometry"]["type"] == "Polygon"
    assert len(site_data["geometry"]["coordinates"][0]) == 5
    site_id = site_data["id"]

    # 3. User A lists sites for project
    list_res = client.get(f"/api/v1/projects/{proj_id}/sites", headers=headers_a)
    assert list_res.status_code == 200
    assert len(list_res.json()) == 1
    assert list_res.json()[0]["id"] == site_id

    # 4. User B attempts to view User A's site -> returns 404
    get_res_b = client.get(f"/api/v1/sites/{site_id}", headers=headers_b)
    assert get_res_b.status_code == 404

    # 5. Invalid Geometry test: unclosed polygon ring (fewer than 4 points)
    invalid_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [-84.1, 9.9],
                [-84.1, 10.0],
            ]
        ],
    }
    bad_site_res = client.post(
        f"/api/v1/projects/{proj_id}/sites",
        headers=headers_a,
        json={
            "name": "Bad Polygon Site",
            "geometry": invalid_polygon,
        },
    )
    assert bad_site_res.status_code in (400, 422)

    # 6. User A updates Site details and geometry
    updated_polygon = {
        "type": "Polygon",
        "coordinates": [
            [
                [-84.2, 9.8],
                [-84.2, 10.1],
                [-83.9, 10.1],
                [-83.9, 9.8],
                [-84.2, 9.8],
            ]
        ],
    }
    update_res = client.put(
        f"/api/v1/sites/{site_id}",
        headers=headers_a,
        json={
            "name": "Monteverde Expanded Zone",
            "area": 750.0,
            "geometry": updated_polygon,
        },
    )
    assert update_res.status_code == 200
    assert update_res.json()["name"] == "Monteverde Expanded Zone"
    assert update_res.json()["area"] == 750.0

    # 7. User A deletes Site
    del_res = client.delete(f"/api/v1/sites/{site_id}", headers=headers_a)
    assert del_res.status_code == 204

    # 8. GET after delete returns 404
    get_after_del = client.get(f"/api/v1/sites/{site_id}", headers=headers_a)
    assert get_after_del.status_code == 404

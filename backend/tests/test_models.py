from datetime import date
import uuid
from geoalchemy2.elements import WKTElement
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database.init_db import init_db
from app.database.session import SessionLocal
from app.models.analytics import SiteAnalytics
from app.models.project import Project
from app.models.site import Site
from app.models.user import User


def setup_module():
    """Ensure database tables and PostGIS extension exist before running model tests."""
    init_db()


def test_user_project_site_analytics_cascade():
    db: Session = SessionLocal()
    try:
        unique_email = f"cascade_{uuid.uuid4().hex[:8]}@darukaa.earth"
        # 1. Create User
        user = User(email=unique_email, password_hash="hashed_secret_123")
        db.add(user)
        db.commit()
        db.refresh(user)

        # 2. Create Project linked to User
        project = Project(
            user_id=user.id,
            name="Amazon Carbon Reserve",
            description="Primary forest conservation",
            project_type="carbon",
            status="active",
        )
        db.add(project)
        db.commit()
        db.refresh(project)

        # 3. Create Site with PostGIS Polygon geometry linked to Project
        polygon_wkt = "POLYGON((-60.0 3.0, -60.0 3.1, -59.9 3.1, -59.9 3.0, -60.0 3.0))"
        site = Site(
            project_id=project.id,
            name="Sector A - Reserve",
            description="Dense canopy zone",
            area=1250.5,
            geometry=WKTElement(polygon_wkt, srid=4326),
        )
        db.add(site)
        db.commit()
        db.refresh(site)

        # 4. Create SiteAnalytics linked to Site
        analytics = SiteAnalytics(
            site_id=site.id,
            date=date.today(),
            carbon_value=450.75,
            biodiversity_score=8.9,
        )
        db.add(analytics)
        db.commit()
        db.refresh(analytics)

        # 5. Verify relationships
        assert len(user.projects) == 1
        assert user.projects[0].id == project.id
        assert len(project.sites) == 1
        assert project.sites[0].id == site.id
        assert len(site.analytics) == 1
        assert site.analytics[0].id == analytics.id
        assert site.area == 1250.5
        assert analytics.carbon_value == 450.75

        # 6. Verify Cascade Deletion: Deleting User deletes Project -> Site -> SiteAnalytics
        user_id = user.id
        site_id = site.id
        db.delete(user)
        db.commit()

        assert db.query(User).filter(User.id == user_id).first() is None
        assert db.query(Project).filter(Project.user_id == user_id).first() is None
        assert db.query(Site).filter(Site.id == site_id).first() is None
        assert db.query(SiteAnalytics).filter(SiteAnalytics.site_id == site_id).first() is None

    finally:
        db.close()


def test_postgis_polygon_storage_and_spatial_query():
    db: Session = SessionLocal()
    try:
        user = User(
            email=f"postgis_{uuid.uuid4().hex[:8]}@darukaa.earth",
            password_hash="hashed_pwd",
        )
        db.add(user)
        db.commit()

        project = Project(
            user_id=user.id,
            name="Spatial Test Project",
            project_type="biodiversity",
        )
        db.add(project)
        db.commit()

        polygon_wkt = "POLYGON((-122.4 37.7, -122.4 37.8, -122.3 37.8, -122.3 37.7, -122.4 37.7))"
        site = Site(
            project_id=project.id,
            name="San Francisco Bay Site",
            area=50.0,
            geometry=WKTElement(polygon_wkt, srid=4326),
        )
        db.add(site)
        db.commit()

        # Query database converting geometry back to WKT text via PostGIS func.ST_AsText
        queried_site = (
            db.query(
                Site.id,
                Site.name,
                func.ST_AsText(Site.geometry).label("wkt_geometry"),
            )
            .filter(Site.id == site.id)
            .first()
        )

        assert queried_site is not None
        assert queried_site.name == "San Francisco Bay Site"
        assert "POLYGON" in queried_site.wkt_geometry.upper()

        db.delete(user)
        db.commit()
    finally:
        db.close()

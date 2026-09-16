from typing import Any, Dict, List, Optional
from uuid import UUID
from geoalchemy2.shape import from_shape, to_shape
from shapely.geometry import Polygon, mapping, shape
from sqlalchemy.orm import Session

from app.models.site import Site
from app.schemas.site import SiteCreate, SiteUpdate


def parse_geojson_to_postgis(geojson_data: Any):
    """Validate GeoJSON dictionary/model and convert to PostGIS geometry (SRID 4326)."""
    if hasattr(geojson_data, "model_dump"):
        geo_dict = geojson_data.model_dump()
    elif isinstance(geojson_data, dict):
        geo_dict = geojson_data
    else:
        raise ValueError("Invalid GeoJSON data format")

    try:
        geom = shape(geo_dict)
    except Exception as e:
        raise ValueError(f"Malformed geometry: {str(e)}")

    if not isinstance(geom, Polygon):
        raise ValueError(f"Geometry must be a Polygon, got {geom.geom_type}")

    if not geom.is_valid:
        raise ValueError("Polygon geometry is invalid (self-intersecting or unclosed ring)")

    if len(geom.exterior.coords) < 4:
        raise ValueError("Polygon exterior ring must have at least 4 coordinate points")

    return from_shape(geom, srid=4326)


from shapely.wkt import loads as wkt_loads


def postgis_to_geojson_dict(site: Site) -> Dict[str, Any]:
    """Convert PostGIS Site.geometry back to GeoJSON dictionary."""
    if site.geometry is None:
        return {}
    if isinstance(site.geometry, dict):
        return site.geometry
    try:
        shapely_geom = to_shape(site.geometry)
        return mapping(shapely_geom)
    except Exception:
        try:
            shapely_geom = wkt_loads(str(site.geometry))
            return mapping(shapely_geom)
        except Exception:
            return {}


def site_to_read_dict(site: Site) -> Dict[str, Any]:
    """Format Site instance into a dictionary ready for SiteRead Pydantic response."""
    return {
        "id": site.id,
        "project_id": site.project_id,
        "name": site.name,
        "description": site.description,
        "area": site.area,
        "geometry": postgis_to_geojson_dict(site),
        "created_at": site.created_at,
        "updated_at": site.updated_at,
    }


def create_site(db: Session, project_id: UUID, site_in: SiteCreate) -> Site:
    """Create a new site linked to project_id."""
    postgis_geom = parse_geojson_to_postgis(site_in.geometry)
    site = Site(
        project_id=project_id,
        name=site_in.name,
        description=site_in.description,
        area=site_in.area,
        geometry=postgis_geom,
    )
    db.add(site)
    db.commit()
    db.refresh(site)
    return site


def get_project_sites(db: Session, project_id: UUID) -> List[Site]:
    """Retrieve all sites belonging to project_id."""
    return db.query(Site).filter(Site.project_id == project_id).order_by(Site.created_at.desc()).all()


def get_site_by_id(db: Session, site_id: UUID) -> Optional[Site]:
    """Retrieve site by ID."""
    return db.query(Site).filter(Site.id == site_id).first()


def update_site(db: Session, site: Site, site_in: SiteUpdate) -> Site:
    """Update site attributes and geometry."""
    update_data = site_in.model_dump(exclude_unset=True)
    if "geometry" in update_data and update_data["geometry"] is not None:
        postgis_geom = parse_geojson_to_postgis(update_data["geometry"])
        site.geometry = postgis_geom
        del update_data["geometry"]

    for field, value in update_data.items():
        setattr(site, field, value)

    db.commit()
    db.refresh(site)
    return site


def delete_site(db: Session, site: Site) -> None:
    """Delete site (cascades to analytics)."""
    db.delete(site)
    db.commit()

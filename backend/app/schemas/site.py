from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from pydantic import BaseModel, Field


class GeoJSONPolygon(BaseModel):
    type: Literal["Polygon"] = "Polygon"
    coordinates: List[List[List[float]]] = Field(
        ...,
        description="Coordinates formatted as [[[lng, lat], [lng, lat], ...]]"
    )


class SiteBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Site name")
    description: Optional[str] = None
    area: Optional[float] = Field(None, ge=0.0, description="Site area")
    geometry: GeoJSONPolygon = Field(..., description="GeoJSON Polygon geometry")


class SiteCreate(SiteBase):
    pass


class SiteUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    area: Optional[float] = Field(None, ge=0.0)
    geometry: Optional[GeoJSONPolygon] = None


class SiteRead(BaseModel):
    id: UUID
    project_id: UUID
    name: str
    description: Optional[str] = None
    area: Optional[float] = None
    geometry: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

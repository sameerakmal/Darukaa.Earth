from datetime import date as date_type
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field


class SiteAnalyticsBase(BaseModel):
    date: Optional[date_type] = Field(default_factory=date_type.today)
    carbon_value: float = Field(..., ge=0.0, description="Carbon value metric e.g. metric tons CO2e")
    biodiversity_score: float = Field(..., ge=0.0, le=100.0, description="Biodiversity index score (0-100)")


class SiteAnalyticsCreate(SiteAnalyticsBase):
    pass


class SiteAnalyticsRead(SiteAnalyticsBase):
    id: UUID
    site_id: UUID

    model_config = {"from_attributes": True}

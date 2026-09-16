from typing import List
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.analytics import SiteAnalytics
from app.schemas.analytics import SiteAnalyticsCreate


def create_site_analytics(
    db: Session, site_id: UUID, analytics_in: SiteAnalyticsCreate
) -> SiteAnalytics:
    """Create a new analytics record for site_id."""
    analytics = SiteAnalytics(
        site_id=site_id,
        date=analytics_in.date,
        carbon_value=analytics_in.carbon_value,
        biodiversity_score=analytics_in.biodiversity_score,
    )
    db.add(analytics)
    db.commit()
    db.refresh(analytics)
    return analytics


def get_site_analytics(db: Session, site_id: UUID) -> List[SiteAnalytics]:
    """Retrieve all analytics entries for site_id ordered by date."""
    return (
        db.query(SiteAnalytics)
        .filter(SiteAnalytics.site_id == site_id)
        .order_by(SiteAnalytics.date.desc())
        .all()
    )

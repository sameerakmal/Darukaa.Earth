from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.analytics import SiteAnalyticsCreate, SiteAnalyticsRead
from app.services.analytics_service import create_site_analytics, get_site_analytics
from app.services.site_service import get_site_by_id

router = APIRouter(prefix="/sites", tags=["Site Analytics"])


@router.post(
    "/{site_id}/analytics",
    response_model=SiteAnalyticsRead,
    status_code=status.HTTP_201_CREATED,
)
def add_analytics_record(
    site_id: UUID,
    analytics_in: SiteAnalyticsCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a carbon and biodiversity analytics entry for a site (verifying site ownership)."""
    site = get_site_by_id(db, site_id)
    if not site or site.project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return create_site_analytics(db, site_id, analytics_in)


@router.get(
    "/{site_id}/analytics",
    response_model=List[SiteAnalyticsRead],
)
def list_analytics_records(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve analytics entries for a site (verifying site ownership)."""
    site = get_site_by_id(db, site_id)
    if not site or site.project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return get_site_analytics(db, site_id)

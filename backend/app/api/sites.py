from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.site import SiteCreate, SiteRead, SiteUpdate
from app.services.project_service import get_user_project_by_id
from app.services.site_service import (
    create_site,
    delete_site,
    get_project_sites,
    get_site_by_id,
    site_to_read_dict,
    update_site,
)

router = APIRouter(tags=["Sites"])


@router.post(
    "/projects/{project_id}/sites",
    response_model=SiteRead,
    status_code=status.HTTP_201_CREATED,
)
def create_new_site(
    project_id: UUID,
    site_in: SiteCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new site within a project (verifying project ownership)."""
    project = get_user_project_by_id(db, current_user.id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    try:
        site = create_site(db, project_id, site_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return site_to_read_dict(site)


@router.get(
    "/projects/{project_id}/sites",
    response_model=List[SiteRead],
)
def list_sites_for_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all sites belonging to a project (verifying project ownership)."""
    project = get_user_project_by_id(db, current_user.id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )

    sites = get_project_sites(db, project_id)
    return [site_to_read_dict(s) for s in sites]


@router.get("/sites/{site_id}", response_model=SiteRead)
def get_site_details(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve site details (verifying user ownership of the parent project)."""
    site = get_site_by_id(db, site_id)
    if not site or site.project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    return site_to_read_dict(site)


@router.put("/sites/{site_id}", response_model=SiteRead)
def update_site_details(
    site_id: UUID,
    site_in: SiteUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update site details or PostGIS polygon geometry (verifying project ownership)."""
    site = get_site_by_id(db, site_id)
    if not site or site.project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    try:
        updated = update_site(db, site, site_in)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    return site_to_read_dict(updated)


@router.delete("/sites/{site_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_site_by_id(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a site (verifying project ownership)."""
    site = get_site_by_id(db, site_id)
    if not site or site.project.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Site not found",
        )

    delete_site(db, site)
    return None

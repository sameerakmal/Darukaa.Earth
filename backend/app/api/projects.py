from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database.session import get_db
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectRead, ProjectUpdate
from app.services.project_service import (
    create_project,
    delete_project,
    get_user_project_by_id,
    get_user_projects,
    update_project,
)

router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("", response_model=ProjectRead, status_code=status.HTTP_201_CREATED)
def create_new_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Create a new project for the authenticated user."""
    return create_project(db, current_user.id, project_in)


@router.get("", response_model=List[ProjectRead])
def list_user_projects(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all projects belonging to the authenticated user."""
    return get_user_projects(db, current_user.id)


@router.get("/{project_id}", response_model=ProjectRead)
def get_project_details(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve details of a specific project (must be owned by authenticated user)."""
    project = get_user_project_by_id(db, current_user.id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return project


@router.put("/{project_id}", response_model=ProjectRead)
def update_project_details(
    project_id: UUID,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update project details (must be owned by authenticated user)."""
    project = get_user_project_by_id(db, current_user.id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    return update_project(db, project, project_in)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_project(
    project_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a project and all associated sites/analytics (must be owned by authenticated user)."""
    project = get_user_project_by_id(db, current_user.id, project_id)
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found",
        )
    delete_project(db, project)
    return None

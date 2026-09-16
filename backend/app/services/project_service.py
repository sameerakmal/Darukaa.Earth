from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


def create_project(db: Session, user_id: UUID, project_in: ProjectCreate) -> Project:
    """Create a new project owned by user_id."""
    project = Project(
        user_id=user_id,
        name=project_in.name,
        description=project_in.description,
        project_type=project_in.project_type,
        status=project_in.status,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def get_user_projects(db: Session, user_id: UUID) -> List[Project]:
    """Retrieve all projects created by user_id."""
    return db.query(Project).filter(Project.user_id == user_id).order_by(Project.created_at.desc()).all()


def get_user_project_by_id(db: Session, user_id: UUID, project_id: UUID) -> Optional[Project]:
    """Retrieve project by ID ensuring ownership by user_id."""
    return db.query(Project).filter(Project.id == project_id, Project.user_id == user_id).first()


def update_project(db: Session, project: Project, project_in: ProjectUpdate) -> Project:
    """Update existing project fields."""
    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project: Project) -> None:
    """Delete project (cascades to sites and analytics)."""
    db.delete(project)
    db.commit()

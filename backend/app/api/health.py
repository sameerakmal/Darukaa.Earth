from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.config import settings
from app.database.session import get_db

router = APIRouter()


@router.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint to verify backend system status and database connectivity."""
    db_status = "disconnected"
    status = "degraded"

    try:
        result = db.execute(text("SELECT 1")).scalar()
        if result == 1:
            db_status = "connected"
            status = "healthy"
    except Exception as e:
        db_status = f"disconnected: {str(e)}"

    return {
        "status": status,
        "database": db_status,
        "version": settings.VERSION,
        "project": settings.PROJECT_NAME,
    }

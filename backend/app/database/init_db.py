from sqlalchemy import text
from app.database.session import Base, engine
import app.models  # noqa: F401 - Register all models with Base.metadata


def init_db() -> None:
    """Initialize PostGIS extension and create database tables."""
    try:
        with engine.begin() as conn:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
    except Exception as e:
        print(f"PostGIS extension initialization warning/info: {e}")

    Base.metadata.create_all(bind=engine)

import logging
from sqlalchemy import text
from app.core.config import settings
from app.database.session import Base, engine, is_postgres, using_sqlite_fallback
import app.models  # noqa: F401 - Register all models with Base.metadata

logger = logging.getLogger(__name__)


def init_db() -> None:
    """Initialize PostGIS extension and create database tables."""
    if is_postgres and not using_sqlite_fallback:
        try:
            with engine.begin() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
            logger.info("PostGIS extension initialized successfully.")
        except Exception as e:
            err_msg = f"PostGIS extension initialization failed on PostgreSQL: {e}"
            if not settings.should_allow_sqlite_fallback():
                logger.critical(err_msg)
                raise RuntimeError(err_msg) from e
            logger.warning(err_msg)

    Base.metadata.create_all(bind=engine)


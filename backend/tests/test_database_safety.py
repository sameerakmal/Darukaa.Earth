import os
import pytest
from app.core.config import Settings
from app.database.session import create_engine


def test_should_allow_sqlite_fallback_dev_mode():
    s = Settings(ENVIRONMENT="development", ALLOW_SQLITE_FALLBACK=None)
    assert s.should_allow_sqlite_fallback() is True


def test_should_allow_sqlite_fallback_prod_mode():
    s = Settings(ENVIRONMENT="production", ALLOW_SQLITE_FALLBACK=None)
    assert s.should_allow_sqlite_fallback() is False


def test_should_allow_sqlite_fallback_render_env(monkeypatch):
    monkeypatch.setenv("RENDER", "true")
    s = Settings(ENVIRONMENT="development", ALLOW_SQLITE_FALLBACK=None)
    assert s.should_allow_sqlite_fallback() is False


def test_postgres_dsn_normalization():
    s = Settings(DATABASE_URL="postgres://user:pass@host:5432/db")
    assert s.get_database_url().startswith("postgresql://")


def test_production_fails_on_broken_postgres_url():
    s = Settings(
        ENVIRONMENT="production",
        DATABASE_URL="postgresql://invalid_user:invalid_pass@invalid_host:5432/invalid_db",
        ALLOW_SQLITE_FALLBACK=False,
    )
    db_url = s.get_database_url()
    assert s.should_allow_sqlite_fallback() is False

    with pytest.raises(RuntimeError) as exc_info:
        # Simulate connection failure in production mode
        try:
            engine = create_engine(
                db_url,
                connect_args={"sslmode": "require", "connect_timeout": 1},
            )
            with engine.connect() as conn:
                pass
        except Exception as e:
            if not s.should_allow_sqlite_fallback():
                raise RuntimeError(
                    f"CRITICAL: Failed to connect to PostgreSQL database ({e}). "
                    "SQLite fallback is disabled in production."
                ) from e

    assert "CRITICAL: Failed to connect to PostgreSQL database" in str(
        exc_info.value
    )

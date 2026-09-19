import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Darukaa.Earth API"
    VERSION: str = "0.1.0"
    API_V1_STR: str = "/api/v1"

    # Environment & Deployment Mode
    ENVIRONMENT: str = "development"
    ALLOW_SQLITE_FALLBACK: Optional[bool] = None

    # JWT Authentication Configuration
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_USER: str = "darukaa"
    POSTGRES_PASSWORD: str = "darukaa_secret"
    POSTGRES_DB: str = "darukaa_earth"
    DATABASE_URL: Optional[str] = None

    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ]

    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )

    def should_allow_sqlite_fallback(self) -> bool:
        """Determine whether falling back to SQLite on Postgres connection failure is permitted."""
        if self.ALLOW_SQLITE_FALLBACK is not None:
            return self.ALLOW_SQLITE_FALLBACK
        env = (self.ENVIRONMENT or "").strip().lower()
        if env in ("production", "prod") or os.environ.get("RENDER") == "true":
            return False
        return True

    def get_database_url(self) -> str:
        if self.DATABASE_URL:
            url = self.DATABASE_URL.strip()
            if url.startswith("DATABASE_URL="):
                url = url[len("DATABASE_URL=") :]
            if url.startswith("postgres://"):
                url = "postgresql://" + url[len("postgres://") :]
            return url
        return f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"


settings = Settings()


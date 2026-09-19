import logging
from typing import Generator
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

logger = logging.getLogger(__name__)

db_url = settings.get_database_url()
is_postgres = db_url.startswith("postgresql") or db_url.startswith("postgres")
using_sqlite_fallback = False

# Azure PostgreSQL (and standard PostgreSQL) connections use SSL.
# Pass sslmode=require via connect_args whenever the URL is a PostgreSQL DSN.
# The SQLite fallback path (below) does not use this argument.
_pg_connect_args = (
    {"sslmode": "require"} if is_postgres else {}
)

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        echo=False,
        connect_args=_pg_connect_args,
    )
    with engine.connect() as conn:
        conn.execute(text("SELECT 1"))
except Exception as e:
    allow_fallback = settings.should_allow_sqlite_fallback()
    if is_postgres and not allow_fallback:
        err_msg = (
            f"CRITICAL: Failed to connect to PostgreSQL database ({e}). "
            "SQLite fallback is disabled in production."
        )
        logger.critical(err_msg)
        raise RuntimeError(err_msg) from e

    print(f"[WARNING] PostgreSQL connection unavailable ({e}). Using SQLite fallback.")
    using_sqlite_fallback = True
    db_url = "sqlite:///./darukaa_fallback.db"
    engine = create_engine(
        db_url,
        connect_args={"check_same_thread": False},
        echo=False,
    )

    @event.listens_for(engine, "connect")
    def setup_sqlite(dbapi_connection, connection_record):
        from shapely.wkt import loads as wkt_loads
        from shapely.wkb import loads as wkb_loads

        def ewkt_to_hex(val, *args):
            if not val:
                return ""
            s = str(val)
            if s.startswith("SRID="):
                s = s.split(";", 1)[1]
            try:
                g = wkt_loads(s)
                return g.wkb_hex
            except Exception:
                return s

        def to_wkt(val, *args):
            if not val:
                return ""
            s = str(val)
            if "POLYGON" in s.upper():
                return s
            try:
                g = wkb_loads(bytes.fromhex(s))
                return g.wkt
            except Exception:
                return s

        funcs = {
            "ST_AsText": to_wkt,
            "AsEWKB": ewkt_to_hex,
            "AsEWKT": to_wkt,
            "AsText": to_wkt,
            "ST_AsBinary": ewkt_to_hex,
            "GeomFromEWKT": ewkt_to_hex,
            "ST_GeomFromText": ewkt_to_hex,
            "ST_GeomFromEWKT": ewkt_to_hex,
            "RecoverGeometryColumn": lambda *args: 1,
            "AddGeometryColumn": lambda *args: 1,
            "InitSpatialMetaData": lambda *args: 1,
            "CreateSpatialIndex": lambda *args: 1,
        }
        for name, fn in funcs.items():
            try:
                dbapi_connection.create_function(name, -1, fn)
            except Exception:
                pass

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator:
    """Dependency for getting DB session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

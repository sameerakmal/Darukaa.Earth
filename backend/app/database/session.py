from typing import Generator
from sqlalchemy import create_engine, event, text
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings

db_url = settings.get_database_url()

# Azure PostgreSQL (and standard PostgreSQL) connections use SSL.
# Pass sslmode=require via connect_args whenever the URL is a PostgreSQL DSN.
# The SQLite fallback path (below) does not use this argument.
_pg_connect_args = (
    {"sslmode": "require"} if db_url.startswith("postgresql") else {}
)

try:
    engine = create_engine(
        db_url,
        pool_pre_ping=True,
        echo=False,
        connect_args=_pg_connect_args,
    )
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"PostgreSQL connection unavailable ({e}). Using SQLite fallback.")
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

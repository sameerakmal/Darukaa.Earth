from datetime import datetime, timezone
import uuid
from geoalchemy2 import Geometry
from sqlalchemy import Column, DateTime, Float, ForeignKey, String, Text
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.guid import GUID


class Site(Base):
    __tablename__ = "sites"

    id = Column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    project_id = Column(
        GUID,
        ForeignKey("projects.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    area = Column(Float, nullable=True)
    geometry = Column(
        Geometry(geometry_type="POLYGON", srid=4326), nullable=False
    )
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    project = relationship("Project", back_populates="sites")
    analytics = relationship(
        "SiteAnalytics", back_populates="site", cascade="all, delete-orphan"
    )

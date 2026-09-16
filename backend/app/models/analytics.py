from datetime import date
import uuid
from sqlalchemy import Column, Date, Float, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.database.session import Base


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    site_id = Column(
        UUID(as_uuid=True),
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False, default=date.today)
    carbon_value = Column(Float, nullable=False, default=0.0)
    biodiversity_score = Column(Float, nullable=False, default=0.0)

    # Relationships
    site = relationship("Site", back_populates="analytics")

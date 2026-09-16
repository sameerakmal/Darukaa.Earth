from datetime import date
import uuid
from sqlalchemy import Column, Date, Float, ForeignKey
from sqlalchemy.orm import relationship

from app.database.session import Base
from app.models.guid import GUID


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id = Column(
        GUID,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    site_id = Column(
        GUID,
        ForeignKey("sites.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    date = Column(Date, nullable=False, default=date.today)
    carbon_value = Column(Float, nullable=False, default=0.0)
    biodiversity_score = Column(Float, nullable=False, default=0.0)

    # Relationships
    site = relationship("Site", back_populates="analytics")

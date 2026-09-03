from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50), nullable=False)  # Attractions, Restaurants, Activities, Cafes, Hotels, Hidden Gems
    description = Column(Text, nullable=True)
    rating = Column(Float, default=4.5)
    price_level = Column(String(10), default="$$")  # $, $$, $$$, $$$$
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    image_url = Column(String(500), nullable=True)
    reason = Column(Text, nullable=True)  # e.g., "Recommended because you selected automotive experiences."
    tags = Column(JSON, default=list)
    is_saved = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="recommendations")

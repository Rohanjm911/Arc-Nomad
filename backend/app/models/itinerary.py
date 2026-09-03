from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, Numeric, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ItineraryDay(Base):
    __tablename__ = "itinerary_days"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    day_number = Column(Integer, nullable=False)  # 1, 2, 3...
    date = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="itinerary_days")
    items = relationship("ItineraryItem", back_populates="day", cascade="all, delete-orphan", order_by="ItineraryItem.order_index")

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    day_id = Column(String(36), ForeignKey("itinerary_days.id", ondelete="CASCADE"), nullable=False, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    location_name = Column(String(255), nullable=True)
    address = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    start_time = Column(String(10), nullable=True)  # e.g., "09:30"
    end_time = Column(String(10), nullable=True)    # e.g., "11:30"
    category = Column(String(50), default="SIGHTSEEING")  # SIGHTSEEING, FOOD, ACTIVITY, TRANSPORT, HOTEL, RELAXATION, OTHER
    estimated_cost = Column(Numeric(10, 2), default=0.0)
    currency = Column(String(10), default="USD")
    order_index = Column(Integer, default=0, nullable=False)
    notes = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    day = relationship("ItineraryDay", back_populates="items")

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Float, Numeric, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    booking_type = Column(String(20), nullable=False)  # "HOTEL" or "RESTAURANT"
    title = Column(String(255), nullable=False)        # Hotel name or Restaurant name
    confirmation_code = Column(String(50), nullable=False, index=True)  # e.g. "ARC-HTL-1049" or "ARC-RES-7821"
    status = Column(String(20), default="CONFIRMED")   # "CONFIRMED", "CANCELLED", "PENDING"
    
    # Timing
    start_date = Column(DateTime, nullable=False)      # Check-in date or dining reservation date
    end_date = Column(DateTime, nullable=True)         # Check-out date for hotels
    time_slot = Column(String(20), nullable=True)      # e.g. "19:30" for restaurants
    party_size = Column(Integer, default=2)            # Number of guests
    
    # Pricing & Location
    total_price = Column(Float, nullable=True)         # Total or estimated cost
    currency = Column(String(10), default="USD")
    address = Column(String(500), nullable=True)
    phone_or_contact = Column(String(100), nullable=True)
    special_requests = Column(Text, nullable=True)
    
    # Flexible JSON metadata (room_type, amenities, cuisine, rating, etc.)
    details = Column(JSON, nullable=True)
    
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", foreign_keys=[trip_id])
    user = relationship("User", foreign_keys=[user_id])

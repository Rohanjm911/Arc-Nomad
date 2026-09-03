from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Float, Numeric, Enum, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class TripRole(str, enum.Enum):
    OWNER = "OWNER"
    EDITOR = "EDITOR"
    VIEWER = "VIEWER"
    EXPENSE_MANAGER = "EXPENSE_MANAGER"

class TripStatus(str, enum.Enum):
    PLANNING = "PLANNING"
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ARCHIVED = "ARCHIVED"

class Trip(Base):
    __tablename__ = "trips"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    destination = Column(String(255), nullable=False)
    destination_lat = Column(Float, nullable=True)
    destination_lng = Column(Float, nullable=True)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    budget = Column(Numeric(12, 2), default=0.0)
    currency = Column(String(10), default="USD")
    cover_image = Column(String(500), nullable=True)
    status = Column(String(20), default=TripStatus.PLANNING.value, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    owner = relationship("User", back_populates="trips_owned")
    members = relationship("TripMember", back_populates="trip", cascade="all, delete-orphan")
    itinerary_days = relationship("ItineraryDay", back_populates="trip", cascade="all, delete-orphan", order_by="ItineraryDay.day_number")
    recommendations = relationship("Recommendation", back_populates="trip", cascade="all, delete-orphan")
    flights = relationship("Flight", back_populates="trip", cascade="all, delete-orphan")
    expenses = relationship("Expense", back_populates="trip", cascade="all, delete-orphan")
    settlements = relationship("Settlement", back_populates="trip", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="trip", cascade="all, delete-orphan")

class TripMember(Base):
    __tablename__ = "trip_members"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(20), default=TripRole.VIEWER.value, nullable=False)
    joined_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="members")
    user = relationship("User", back_populates="trip_memberships")

    __table_args__ = (
        UniqueConstraint("trip_id", "user_id", name="uq_trip_member_trip_user"),
    )

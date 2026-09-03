from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class FlightStatus(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    BOARDING = "BOARDING"
    DEPARTED = "DEPARTED"
    DELAYED = "DELAYED"
    CANCELLED = "CANCELLED"
    LANDED = "LANDED"

class Flight(Base):
    __tablename__ = "flights"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    airline = Column(String(100), nullable=False)
    flight_number = Column(String(50), nullable=False)
    departure_airport = Column(String(10), nullable=False)  # IATA/ICAO e.g. "JFK"
    arrival_airport = Column(String(10), nullable=False)    # e.g. "HND"
    departure_city = Column(String(100), nullable=True)     # e.g. "New York"
    arrival_city = Column(String(100), nullable=True)       # e.g. "Tokyo"
    departure_time = Column(DateTime, nullable=False)
    arrival_time = Column(DateTime, nullable=False)
    terminal = Column(String(20), nullable=True)
    gate = Column(String(20), nullable=True)
    status = Column(String(20), default=FlightStatus.SCHEDULED.value, nullable=False)
    seat = Column(String(20), nullable=True)
    booking_reference = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="flights")
    user = relationship("User")
    status_history = relationship("FlightStatusHistory", back_populates="flight", cascade="all, delete-orphan", order_by="FlightStatusHistory.changed_at.desc()")

class FlightStatusHistory(Base):
    __tablename__ = "flight_status_history"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    flight_id = Column(String(36), ForeignKey("flights.id", ondelete="CASCADE"), nullable=False, index=True)
    old_status = Column(String(20), nullable=True)
    new_status = Column(String(20), nullable=False)
    message = Column(Text, nullable=True)
    changed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    flight = relationship("Flight", back_populates="status_history")

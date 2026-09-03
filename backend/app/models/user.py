from sqlalchemy import Column, String, Text, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    travel_interests = Column(JSON, default=list)  # e.g., ["Food", "Adventure", "Art", "Culture", "Nightlife"]
    travel_style = Column(String(50), default="Balanced")  # "Budget", "Luxury", "Backpacker", "Balanced", "Fast-Paced"
    budget_preference = Column(String(50), default="Moderate")  # "$", "$$", "$$$", "$$$$"
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    trips_owned = relationship("Trip", back_populates="owner", cascade="all, delete-orphan")
    trip_memberships = relationship("TripMember", back_populates="user", cascade="all, delete-orphan")
    expenses_paid = relationship("Expense", back_populates="payer", cascade="all, delete-orphan")
    expense_shares = relationship("ExpenseParticipant", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatMessage", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

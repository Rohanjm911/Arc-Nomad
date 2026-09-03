from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Numeric, Float, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ExpenseCategory(str, enum.Enum):
    FLIGHTS = "FLIGHTS"
    HOTEL = "HOTEL"
    FOOD = "FOOD"
    TRANSPORT = "TRANSPORT"
    ACTIVITIES = "ACTIVITIES"
    SHOPPING = "SHOPPING"
    TICKETS = "TICKETS"
    OTHER = "OTHER"

class SplitType(str, enum.Enum):
    EQUAL = "EQUAL"
    EXACT = "EXACT"
    PERCENTAGE = "PERCENTAGE"

class Expense(Base):
    __tablename__ = "expenses"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    paid_by_user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="USD")
    category = Column(String(50), default=ExpenseCategory.OTHER.value, nullable=False)
    description = Column(String(255), nullable=False)
    expense_date = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)
    split_type = Column(String(20), default=SplitType.EQUAL.value, nullable=False)
    receipt_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="expenses")
    payer = relationship("User", back_populates="expenses_paid")
    participants = relationship("ExpenseParticipant", back_populates="expense", cascade="all, delete-orphan")

class ExpenseParticipant(Base):
    __tablename__ = "expense_participants"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    expense_id = Column(String(36), ForeignKey("expenses.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    share_amount = Column(Numeric(12, 2), nullable=False)
    share_percentage = Column(Float, nullable=True)

    expense = relationship("Expense", back_populates="participants")
    user = relationship("User", back_populates="expense_shares")

class Settlement(Base):
    __tablename__ = "settlements"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    payer_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    receiver_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(10), default="USD")
    is_settled = Column(Boolean, default=False)
    settled_at = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    trip = relationship("Trip", back_populates="settlements")
    payer = relationship("User", foreign_keys=[payer_id])
    receiver = relationship("User", foreign_keys=[receiver_id])

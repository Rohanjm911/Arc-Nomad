from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, JSON, Enum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
import enum
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class NotificationType(str, enum.Enum):
    FRIEND_REQUEST = "FRIEND_REQUEST"
    TRIP_INVITATION = "TRIP_INVITATION"
    ITINERARY_CHANGE = "ITINERARY_CHANGE"
    FLIGHT_DELAY = "FLIGHT_DELAY"
    FLIGHT_CANCELLATION = "FLIGHT_CANCELLATION"
    GATE_CHANGE = "GATE_CHANGE"
    EXPENSE_ACTIVITY = "EXPENSE_ACTIVITY"
    CHAT_ACTIVITY = "CHAT_ACTIVITY"
    SYSTEM = "SYSTEM"

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    type = Column(String(30), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link_url = Column(String(500), nullable=True)
    is_read = Column(Boolean, default=False, index=True)
    extra_data = Column(JSON, default=dict)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    user = relationship("User", back_populates="notifications")

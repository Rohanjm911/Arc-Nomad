from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from backend.app.core.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid, index=True)
    trip_id = Column(String(36), ForeignKey("trips.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    message = Column(Text, nullable=False)
    message_type = Column(String(20), default="TEXT")  # TEXT, SYSTEM, ATTACHMENT
    reactions = Column(JSON, default=dict)  # e.g., {"👍": ["user_id1"], "❤️": ["user_id2"]}
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)

    trip = relationship("Trip", back_populates="chat_messages")
    user = relationship("User", back_populates="chat_messages")

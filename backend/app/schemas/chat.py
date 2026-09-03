from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, List
from datetime import datetime
from backend.app.schemas.user import UserOut

class ChatMessageCreate(BaseModel):
    trip_id: str
    message: str
    message_type: Optional[str] = "TEXT"

class ChatReactionRequest(BaseModel):
    message_id: str
    emoji: str

class ChatMessageOut(BaseModel):
    id: str
    trip_id: str
    user_id: str
    message: str
    message_type: str
    reactions: Dict[str, List[str]] = {}
    created_at: datetime
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

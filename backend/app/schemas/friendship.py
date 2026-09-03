from pydantic import BaseModel, ConfigDict
from typing import Optional
from datetime import datetime
from backend.app.schemas.user import UserOut

class FriendRequestCreate(BaseModel):
    receiver_username_or_email: str

class FriendRequestOut(BaseModel):
    id: str
    sender_id: str
    receiver_id: str
    status: str
    created_at: datetime
    sender: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class FriendshipOut(BaseModel):
    id: str
    user_id: str
    friend_id: str
    created_at: datetime
    friend: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

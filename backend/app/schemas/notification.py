from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime

class NotificationCreate(BaseModel):
    user_id: str
    type: str
    title: str
    message: str
    link_url: Optional[str] = None
    extra_data: Optional[Dict[str, Any]] = None

class NotificationOut(BaseModel):
    id: str
    user_id: str
    type: str
    title: str
    message: str
    link_url: Optional[str] = None
    is_read: bool
    extra_data: Dict[str, Any] = {}
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class NotificationBatchUpdate(BaseModel):
    notification_ids: list[str]
    is_read: bool = True

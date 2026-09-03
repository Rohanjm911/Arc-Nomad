from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    travel_interests: List[str] = []
    travel_style: str = "Balanced"
    budget_preference: str = "Moderate"

class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=100)
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    travel_interests: List[str] = []
    travel_style: Optional[str] = "Balanced"
    budget_preference: Optional[str] = "Moderate"

class UserLogin(BaseModel):
    email_or_username: str
    password: str

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    travel_interests: Optional[List[str]] = None
    travel_style: Optional[str] = None
    budget_preference: Optional[str] = None
    password: Optional[str] = None

class UserOut(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenPayload(BaseModel):
    sub: Optional[str] = None

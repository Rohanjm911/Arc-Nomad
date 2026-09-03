from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from backend.app.core.database import get_db
from backend.app.core.security import get_password_hash
from backend.app.models.user import User
from backend.app.schemas.user import UserOut, UserUpdate
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/search", response_model=List[UserOut])
def search_users(
    q: str = Query(..., min_length=1),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    search_pattern = f"%{q.lower()}%"
    users = db.query(User).filter(
        (User.username.ilike(search_pattern)) | 
        (User.full_name.ilike(search_pattern)) | 
        (User.email.ilike(search_pattern)),
        User.id != current_user.id
    ).limit(10).all()
    return users

@router.put("/profile", response_model=UserOut)
def update_profile(
    user_in: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    if user_in.avatar_url is not None:
        current_user.avatar_url = user_in.avatar_url
    if user_in.bio is not None:
        current_user.bio = user_in.bio
    if user_in.travel_interests is not None:
        current_user.travel_interests = user_in.travel_interests
    if user_in.travel_style is not None:
        current_user.travel_style = user_in.travel_style
    if user_in.budget_preference is not None:
        current_user.budget_preference = user_in.budget_preference
    if user_in.password:
        current_user.hashed_password = get_password_hash(user_in.password)

    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/{user_id}", response_model=UserOut)
def get_user_profile(user_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

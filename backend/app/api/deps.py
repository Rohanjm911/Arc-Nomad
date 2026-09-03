from typing import Generator, Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import decode_token
from backend.app.models.user import User
from backend.app.models.trip import Trip, TripMember, TripRole

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    user_id = decode_token(token)
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_current_user_optional(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> Optional[User]:
    if not token:
        return None
    try:
        user_id = decode_token(token)
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

def get_ws_user(token: str, db: Session) -> Optional[User]:
    try:
        user_id = decode_token(token)
        if not user_id:
            return None
        return db.query(User).filter(User.id == user_id).first()
    except Exception:
        return None

def check_trip_member(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> tuple[Trip, str]:
    """
    Verifies that the current user has access to the trip.
    Returns (trip, user_role).
    """
    trip = db.query(Trip).filter(Trip.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

    if trip.owner_id == current_user.id:
        return trip, TripRole.OWNER.value

    member = db.query(TripMember).filter(
        TripMember.trip_id == trip_id,
        TripMember.user_id == current_user.id
    ).first()

    if not member:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have access to this trip"
        )

    return trip, member.role

def require_trip_roles(allowed_roles: List[str]):
    def role_checker(
        trip_id: str,
        db: Session = Depends(get_db),
        current_user: User = Depends(get_current_user)
    ) -> tuple[Trip, str]:
        trip, role = check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
        if role == TripRole.OWNER.value or role in allowed_roles:
            return trip, role
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Insufficient permissions. Required role: {', '.join(allowed_roles)}"
        )
    return role_checker

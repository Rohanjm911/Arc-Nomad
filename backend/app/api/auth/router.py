from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from backend.app.core.database import get_db
from backend.app.core.security import verify_password, get_password_hash, create_access_token
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate, UserLogin, UserOut, Token
from backend.app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check if email or username already exists
    existing_email = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email already exists."
        )
    existing_username = db.query(User).filter(User.username == user_in.username.lower()).first()
    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this username already exists."
        )

    user = User(
        email=user_in.email.lower(),
        username=user_in.username.lower(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        avatar_url=user_in.avatar_url or f"https://api.dicebear.com/7.x/bottts/svg?seed={user_in.username}",
        bio=user_in.bio or "Avid traveler exploring the globe.",
        travel_interests=user_in.travel_interests or ["Culture", "Culinary", "Adventure"],
        travel_style=user_in.travel_style or "Balanced",
        budget_preference=user_in.budget_preference or "Moderate"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    identifier = login_data.email_or_username.lower()
    user = db.query(User).filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email/username or password."
        )

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.post("/demo-login", response_model=Token)
def demo_login(username: str = "alex_nomad", db: Session = Depends(get_db)):
    """Convenience endpoint for 1-click testing with seeded demo accounts."""
    user = db.query(User).filter(User.username == username.lower()).first()
    if not user:
        # Fallback to any user
        user = db.query(User).first()
        if not user:
            raise HTTPException(status_code=404, detail="No users found. Please seed the database first.")

    token = create_access_token(subject=user.id)
    return Token(access_token=token, token_type="bearer", user=UserOut.model_validate(user))

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

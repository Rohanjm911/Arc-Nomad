from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.friendship import Friendship, FriendRequest, FriendRequestStatus
from backend.app.models.notification import NotificationType
from backend.app.schemas.friendship import FriendRequestCreate, FriendRequestOut, FriendshipOut
from backend.app.schemas.user import UserOut
from backend.app.api.deps import get_current_user
from backend.app.services.notifications.service import notification_service

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.get("/", response_model=List[UserOut])
def get_friends(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Find all users who are friends
    friendships = db.query(Friendship).filter(
        (Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)
    ).all()

    friend_ids = set()
    for f in friendships:
        if f.user_id == current_user.id:
            friend_ids.add(f.friend_id)
        else:
            friend_ids.add(f.user_id)

    if not friend_ids:
        return []

    return db.query(User).filter(User.id.in_(friend_ids)).all()

@router.get("/requests", response_model=dict)
def get_friend_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    incoming = db.query(FriendRequest).filter(
        FriendRequest.receiver_id == current_user.id,
        FriendRequest.status == FriendRequestStatus.PENDING.value
    ).all()

    outgoing = db.query(FriendRequest).filter(
        FriendRequest.sender_id == current_user.id,
        FriendRequest.status == FriendRequestStatus.PENDING.value
    ).all()

    return {
        "incoming": [FriendRequestOut.model_validate(r) for r in incoming],
        "outgoing": [FriendRequestOut.model_validate(r) for r in outgoing]
    }

@router.post("/request", response_model=FriendRequestOut, status_code=status.HTTP_201_CREATED)
def send_friend_request(
    req_in: FriendRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    target = req_in.receiver_username_or_email.lower().strip()
    target_user = db.query(User).filter(
        (User.username == target) | (User.email == target)
    ).first()

    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found")

    if target_user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send a friend request to yourself")

    # Check existing friendship
    existing_friend = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == target_user.id)) |
        ((Friendship.user_id == target_user.id) & (Friendship.friend_id == current_user.id))
    ).first()
    if existing_friend:
        raise HTTPException(status_code=400, detail="You are already friends with this user")

    # Check existing request
    existing_req = db.query(FriendRequest).filter(
        ((FriendRequest.sender_id == current_user.id) & (FriendRequest.receiver_id == target_user.id)) |
        ((FriendRequest.sender_id == target_user.id) & (FriendRequest.receiver_id == current_user.id))
    ).first()

    if existing_req:
        if existing_req.status == FriendRequestStatus.PENDING.value:
            if existing_req.sender_id == current_user.id:
                raise HTTPException(status_code=400, detail="Friend request already sent")
            else:
                # Auto-accept reciprocal request
                existing_req.status = FriendRequestStatus.ACCEPTED.value
                f1 = Friendship(user_id=current_user.id, friend_id=target_user.id)
                db.add(f1)
                db.commit()
                db.refresh(existing_req)
                return FriendRequestOut.model_validate(existing_req)
        else:
            # Reopen previous request
            existing_req.sender_id = current_user.id
            existing_req.receiver_id = target_user.id
            existing_req.status = FriendRequestStatus.PENDING.value
            db.commit()
            db.refresh(existing_req)
            req = existing_req
    else:
        req = FriendRequest(
            sender_id=current_user.id,
            receiver_id=target_user.id,
            status=FriendRequestStatus.PENDING.value
        )
        db.add(req)
        db.commit()
        db.refresh(req)

    # Dispatch notification to target user
    notification_service.create_notification(
        db=db,
        user_id=target_user.id,
        type=NotificationType.FRIEND_REQUEST.value,
        title="New Friend Request",
        message=f"{current_user.full_name} (@{current_user.username}) sent you a friend request!",
        link_url="/friends",
        extra_data={"sender_id": current_user.id}
    )

    return FriendRequestOut.model_validate(req)

@router.post("/request/{request_id}/accept")
def accept_friend_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FriendRequest).filter(
        FriendRequest.id == request_id,
        FriendRequest.receiver_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Friend request not found")

    if req.status != FriendRequestStatus.PENDING.value:
        raise HTTPException(status_code=400, detail=f"Request is already {req.status}")

    req.status = FriendRequestStatus.ACCEPTED.value

    # Create friendship record
    f1 = Friendship(user_id=req.sender_id, friend_id=req.receiver_id)
    db.add(f1)
    db.commit()

    # Notify sender
    notification_service.create_notification(
        db=db,
        user_id=req.sender_id,
        type=NotificationType.SYSTEM.value,
        title="Friend Request Accepted",
        message=f"{current_user.full_name} accepted your friend request!",
        link_url="/friends",
        extra_data={"friend_id": current_user.id}
    )

    return {"message": "Friend request accepted"}

@router.post("/request/{request_id}/reject")
def reject_friend_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FriendRequest).filter(
        FriendRequest.id == request_id,
        FriendRequest.receiver_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Friend request not found")

    req.status = FriendRequestStatus.REJECTED.value
    db.commit()
    return {"message": "Friend request rejected"}

@router.post("/request/{request_id}/cancel")
def cancel_friend_request(
    request_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    req = db.query(FriendRequest).filter(
        FriendRequest.id == request_id,
        FriendRequest.sender_id == current_user.id
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Friend request not found")

    req.status = FriendRequestStatus.CANCELLED.value
    db.commit()
    return {"message": "Friend request cancelled"}

@router.delete("/{friend_id}/remove")
def remove_friend(
    friend_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    friendship = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id))
    ).first()

    if not friendship:
        raise HTTPException(status_code=404, detail="Friendship not found")

    db.delete(friendship)
    db.commit()
    return {"message": "Friend removed"}

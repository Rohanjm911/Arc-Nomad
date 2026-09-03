import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status, WebSocket, WebSocketDisconnect, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from backend.app.core.database import get_db, SessionLocal
from backend.app.models.user import User
from backend.app.models.trip import Trip, TripMember
from backend.app.models.chat import ChatMessage
from backend.app.schemas.chat import ChatMessageOut, ChatMessageCreate, ChatReactionRequest
from backend.app.api.deps import get_current_user, check_trip_member, get_ws_user
from backend.app.websocket.manager import ws_manager

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.get("/{trip_id}/messages", response_model=List[ChatMessageOut])
def get_chat_history(
    trip_id: str,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    messages = db.query(ChatMessage).filter(ChatMessage.trip_id == trip_id).order_by(ChatMessage.created_at.asc()).limit(limit).all()
    return messages

@router.post("/{trip_id}/messages", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
async def send_chat_message(
    trip_id: str,
    msg_in: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)

    msg = ChatMessage(
        trip_id=trip_id,
        user_id=current_user.id,
        message=msg_in.message,
        message_type=msg_in.message_type or "TEXT",
        reactions={}
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    out = ChatMessageOut.model_validate(msg)

    # Broadcast to WebSocket room
    await ws_manager.broadcast_to_trip(trip_id, {
        "event": "new_message",
        "data": out.model_dump(mode="json")
    })

    return out

@router.post("/{trip_id}/messages/{message_id}/reactions")
async def toggle_chat_reaction(
    trip_id: str,
    message_id: str,
    reaction_in: ChatReactionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)

    msg = db.query(ChatMessage).filter(ChatMessage.id == message_id, ChatMessage.trip_id == trip_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    reactions = dict(msg.reactions or {})
    emoji = reaction_in.emoji
    user_list = reactions.get(emoji, [])

    if current_user.id in user_list:
        user_list.remove(current_user.id)
        if not user_list:
            del reactions[emoji]
        else:
            reactions[emoji] = user_list
    else:
        user_list.append(current_user.id)
        reactions[emoji] = user_list

    msg.reactions = reactions
    db.commit()
    db.refresh(msg)

    # Broadcast reaction change
    await ws_manager.broadcast_to_trip(trip_id, {
        "event": "reaction_updated",
        "data": {
            "message_id": msg.id,
            "reactions": msg.reactions
        }
    })

    return {"message_id": msg.id, "reactions": msg.reactions}

# ----------------- REAL-TIME WEBSOCKET -----------------

@router.websocket("/{trip_id}/ws")
async def chat_websocket_endpoint(
    websocket: WebSocket,
    trip_id: str,
    token: Optional[str] = Query(None)
):
    db = SessionLocal()
    try:
        # Authenticate user from query token
        if not token:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        user = get_ws_user(token=token, db=db)
        if not user:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Check membership
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        is_member = trip.owner_id == user.id or db.query(TripMember).filter(
            TripMember.trip_id == trip_id, TripMember.user_id == user.id
        ).first() is not None

        if not is_member:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # Connect to room
        await ws_manager.connect(websocket, trip_id=trip_id, user_id=user.id)

        # Broadcast user online
        await ws_manager.broadcast_to_trip(trip_id, {
            "event": "user_status",
            "data": {
                "user_id": user.id,
                "user_name": user.full_name,
                "status": "online",
                "online_users": ws_manager.get_online_users(trip_id)
            }
        })

        while True:
            raw_text = await websocket.receive_text()
            try:
                payload = json.loads(raw_text)
                action = payload.get("action")

                if action == "send_message":
                    text = payload.get("message", "").strip()
                    if text:
                        new_msg = ChatMessage(
                            trip_id=trip_id,
                            user_id=user.id,
                            message=text,
                            message_type="TEXT",
                            reactions={}
                        )
                        db.add(new_msg)
                        db.commit()
                        db.refresh(new_msg)

                        msg_out = ChatMessageOut.model_validate(new_msg)
                        await ws_manager.broadcast_to_trip(trip_id, {
                            "event": "new_message",
                            "data": msg_out.model_dump(mode="json")
                        })

                elif action == "typing":
                    await ws_manager.broadcast_to_trip(trip_id, {
                        "event": "user_typing",
                        "data": {
                            "user_id": user.id,
                            "user_name": user.full_name,
                            "is_typing": payload.get("is_typing", True)
                        }
                    })

                elif action == "reaction":
                    msg_id = payload.get("message_id")
                    emoji = payload.get("emoji")
                    if msg_id and emoji:
                        msg_record = db.query(ChatMessage).filter(ChatMessage.id == msg_id, ChatMessage.trip_id == trip_id).first()
                        if msg_record:
                            reactions = dict(msg_record.reactions or {})
                            user_list = reactions.get(emoji, [])
                            if user.id in user_list:
                                user_list.remove(user.id)
                                if not user_list:
                                    del reactions[emoji]
                                else:
                                    reactions[emoji] = user_list
                            else:
                                user_list.append(user.id)
                                reactions[emoji] = user_list
                            msg_record.reactions = reactions
                            db.commit()
                            await ws_manager.broadcast_to_trip(trip_id, {
                                "event": "reaction_updated",
                                "data": {"message_id": msg_id, "reactions": reactions}
                            })
            except Exception as inner_e:
                logger.warning(f"Error handling WebSocket message: {inner_e}")

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, trip_id=trip_id, user_id=user.id)
        await ws_manager.broadcast_to_trip(trip_id, {
            "event": "user_status",
            "data": {
                "user_id": user.id,
                "user_name": user.full_name,
                "status": "offline",
                "online_users": ws_manager.get_online_users(trip_id)
            }
        })
    finally:
        db.close()

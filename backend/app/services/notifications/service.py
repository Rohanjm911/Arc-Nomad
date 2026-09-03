from sqlalchemy.orm import Session
from typing import Optional, Dict, Any, List
from backend.app.models.notification import Notification, NotificationType
from backend.app.models.trip import TripMember

class NotificationService:
    @staticmethod
    def create_notification(
        db: Session,
        user_id: str,
        type: str,
        title: str,
        message: str,
        link_url: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ) -> Notification:
        notification = Notification(
            user_id=user_id,
            type=type,
            title=title,
            message=message,
            link_url=link_url,
            extra_data=extra_data or {}
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def notify_trip_members(
        db: Session,
        trip_id: str,
        exclude_user_id: Optional[str],
        type: str,
        title: str,
        message: str,
        link_url: Optional[str] = None,
        extra_data: Optional[Dict[str, Any]] = None
    ):
        members = db.query(TripMember).filter(TripMember.trip_id == trip_id).all()
        for member in members:
            if exclude_user_id and member.user_id == exclude_user_id:
                continue
            notification = Notification(
                user_id=member.user_id,
                type=type,
                title=title,
                message=message,
                link_url=link_url,
                extra_data=extra_data or {}
            )
            db.add(notification)
        db.commit()

notification_service = NotificationService()

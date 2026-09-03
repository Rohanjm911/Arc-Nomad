from backend.app.core.database import Base
from backend.app.models.user import User
from backend.app.models.friendship import Friendship, FriendRequest, FriendRequestStatus
from backend.app.models.trip import Trip, TripMember, TripRole, TripStatus
from backend.app.models.itinerary import ItineraryDay, ItineraryItem
from backend.app.models.recommendation import Recommendation
from backend.app.models.flight import Flight, FlightStatusHistory, FlightStatus
from backend.app.models.expense import Expense, ExpenseParticipant, Settlement, ExpenseCategory, SplitType
from backend.app.models.chat import ChatMessage
from backend.app.models.notification import Notification, NotificationType

__all__ = [
    "Base",
    "User",
    "Friendship",
    "FriendRequest",
    "FriendRequestStatus",
    "Trip",
    "TripMember",
    "TripRole",
    "TripStatus",
    "ItineraryDay",
    "ItineraryItem",
    "Recommendation",
    "Flight",
    "FlightStatusHistory",
    "FlightStatus",
    "Expense",
    "ExpenseParticipant",
    "Settlement",
    "ExpenseCategory",
    "SplitType",
    "ChatMessage",
    "Notification",
    "NotificationType",
]

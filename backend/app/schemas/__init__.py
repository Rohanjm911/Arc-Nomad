from backend.app.schemas.user import UserBase, UserCreate, UserLogin, UserUpdate, UserOut, Token, TokenPayload
from backend.app.schemas.friendship import FriendRequestCreate, FriendRequestOut, FriendshipOut
from backend.app.schemas.trip import TripBase, TripCreate, TripUpdate, TripOut, TripSummary, TripMemberCreate, TripMemberUpdate, TripMemberOut
from backend.app.schemas.itinerary import (
    ItineraryItemBase, ItineraryItemCreate, ItineraryItemUpdate, ItineraryItemOut,
    ItineraryDayBase, ItineraryDayCreate, ItineraryDayUpdate, ItineraryDayOut,
    ItineraryItemBatchReorder, ItineraryItemReorder
)
from backend.app.schemas.recommendation import RecommendationBase, RecommendationCreate, RecommendationOut, SaveToItineraryRequest
from backend.app.schemas.flight import FlightBase, FlightCreate, FlightUpdate, FlightOut, FlightStatusHistoryOut, FlightSimulateStatusRequest
from backend.app.schemas.expense import (
    ExpenseBase, ExpenseCreate, ExpenseUpdate, ExpenseOut,
    ExpenseParticipantBase, ExpenseParticipantOut,
    SettlementCreate, SettlementOut, SuggestedSettlement, MemberBalance,
    CategorySpending, DailySpending, ExpenseAnalyticsSummary
)
from backend.app.schemas.chat import ChatMessageCreate, ChatMessageOut, ChatReactionRequest
from backend.app.schemas.notification import NotificationCreate, NotificationOut, NotificationBatchUpdate
from backend.app.schemas.ai import (
    AIItineraryRequest, AIRecommendationRequest, AIModifyItineraryRequest,
    GeneratedItineraryResponse, GeneratedRecommendationsResponse,
    GeneratedDayPlan, GeneratedItineraryItem, GeneratedRecommendationItem
)

__all__ = [
    "UserBase", "UserCreate", "UserLogin", "UserUpdate", "UserOut", "Token", "TokenPayload",
    "FriendRequestCreate", "FriendRequestOut", "FriendshipOut",
    "TripBase", "TripCreate", "TripUpdate", "TripOut", "TripSummary", "TripMemberCreate", "TripMemberUpdate", "TripMemberOut",
    "ItineraryItemBase", "ItineraryItemCreate", "ItineraryItemUpdate", "ItineraryItemOut",
    "ItineraryDayBase", "ItineraryDayCreate", "ItineraryDayUpdate", "ItineraryDayOut",
    "ItineraryItemBatchReorder", "ItineraryItemReorder",
    "RecommendationBase", "RecommendationCreate", "RecommendationOut", "SaveToItineraryRequest",
    "FlightBase", "FlightCreate", "FlightUpdate", "FlightOut", "FlightStatusHistoryOut", "FlightSimulateStatusRequest",
    "ExpenseBase", "ExpenseCreate", "ExpenseUpdate", "ExpenseOut",
    "ExpenseParticipantBase", "ExpenseParticipantOut",
    "SettlementCreate", "SettlementOut", "SuggestedSettlement", "MemberBalance",
    "CategorySpending", "DailySpending", "ExpenseAnalyticsSummary",
    "ChatMessageCreate", "ChatMessageOut", "ChatReactionRequest",
    "NotificationCreate", "NotificationOut", "NotificationBatchUpdate",
    "AIItineraryRequest", "AIRecommendationRequest", "AIModifyItineraryRequest",
    "GeneratedItineraryResponse", "GeneratedRecommendationsResponse",
    "GeneratedDayPlan", "GeneratedItineraryItem", "GeneratedRecommendationItem",
]

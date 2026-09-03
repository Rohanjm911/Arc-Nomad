from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Dict
from datetime import datetime
from decimal import Decimal
from backend.app.schemas.user import UserOut

class ExpenseParticipantBase(BaseModel):
    user_id: str
    share_amount: Optional[Decimal] = None
    share_percentage: Optional[float] = None

class ExpenseParticipantOut(BaseModel):
    id: str
    expense_id: str
    user_id: str
    share_amount: Decimal
    share_percentage: Optional[float] = None
    user: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class ExpenseBase(BaseModel):
    amount: Decimal = Field(..., gt=0)
    currency: str = "USD"
    category: str = "OTHER"
    description: str = Field(..., min_length=1, max_length=255)
    expense_date: datetime
    split_type: str = "EQUAL"
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    trip_id: str
    paid_by_user_id: str
    participants: List[ExpenseParticipantBase] = []

class ExpenseUpdate(BaseModel):
    amount: Optional[Decimal] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    expense_date: Optional[datetime] = None
    split_type: Optional[str] = None
    paid_by_user_id: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    participants: Optional[List[ExpenseParticipantBase]] = None

class ExpenseOut(ExpenseBase):
    id: str
    trip_id: str
    paid_by_user_id: str
    created_at: datetime
    updated_at: datetime
    payer: Optional[UserOut] = None
    participants: List[ExpenseParticipantOut] = []

    model_config = ConfigDict(from_attributes=True)

class SettlementOut(BaseModel):
    id: str
    trip_id: str
    payer_id: str
    receiver_id: str
    amount: Decimal
    currency: str
    is_settled: bool
    settled_at: Optional[datetime] = None
    notes: Optional[str] = None
    payer: Optional[UserOut] = None
    receiver: Optional[UserOut] = None

    model_config = ConfigDict(from_attributes=True)

class SettlementCreate(BaseModel):
    trip_id: str
    receiver_id: str
    amount: Decimal
    currency: str = "USD"
    notes: Optional[str] = None

class SuggestedSettlement(BaseModel):
    payer_id: str
    payer_name: str
    payer_avatar: Optional[str] = None
    receiver_id: str
    receiver_name: str
    receiver_avatar: Optional[str] = None
    amount: Decimal
    currency: str

class MemberBalance(BaseModel):
    user_id: str
    user_name: str
    avatar_url: Optional[str] = None
    total_paid: Decimal
    total_share: Decimal
    net_balance: Decimal

class CategorySpending(BaseModel):
    category: str
    amount: Decimal
    percentage: float

class DailySpending(BaseModel):
    date: str
    amount: Decimal

class ExpenseAnalyticsSummary(BaseModel):
    trip_id: str
    total_spent: Decimal
    trip_budget: Decimal
    remaining_budget: Decimal
    budget_usage_percentage: float
    currency: str
    spending_by_category: List[CategorySpending]
    spending_by_member: List[MemberBalance]
    daily_spending: List[DailySpending]
    suggested_settlements: List[SuggestedSettlement]
    recent_expenses: List[ExpenseOut]

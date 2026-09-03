from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List, Optional
from decimal import Decimal
from backend.app.core.database import get_db
from backend.app.models.user import User
from backend.app.models.trip import Trip, TripRole, TripMember
from backend.app.models.expense import Expense, ExpenseParticipant, Settlement, SplitType
from backend.app.models.notification import NotificationType
from backend.app.schemas.expense import (
    ExpenseOut, ExpenseCreate, ExpenseUpdate,
    ExpenseAnalyticsSummary, SettlementCreate, SettlementOut
)
from backend.app.api.deps import get_current_user, check_trip_member, require_trip_roles
from backend.app.services.expenses.calculator import expense_calculator
from backend.app.services.expenses.currency_service import currency_service
from backend.app.services.notifications.service import notification_service

router = APIRouter(prefix="/expenses", tags=["Expenses"])

@router.get("/exchange-rates/latest")
async def get_exchange_rates(base: str = "USD"):
    return await currency_service.get_exchange_rates(base=base)

@router.get("/{trip_id}", response_model=List[ExpenseOut])
def get_trip_expenses(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    expenses = db.query(Expense).filter(Expense.trip_id == trip_id).order_by(Expense.expense_date.desc()).all()
    return expenses

@router.get("/{trip_id}/analytics", response_model=ExpenseAnalyticsSummary)
def get_trip_expense_analytics(
    trip_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=trip_id, db=db, current_user=current_user)
    return expense_calculator.calculate_trip_analytics(db=db, trip_id=trip_id)

@router.post("/", response_model=ExpenseOut, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense_in: ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value, TripRole.EXPENSE_MANAGER.value])(
        trip_id=expense_in.trip_id, db=db, current_user=current_user
    )

    # Determine participating member IDs
    if expense_in.participants:
        member_ids = [p.user_id for p in expense_in.participants]
        custom_shares = [p.dict() for p in expense_in.participants]
    else:
        # Default to all trip members
        all_members = db.query(TripMember).filter(TripMember.trip_id == expense_in.trip_id).all()
        member_ids = [m.user_id for m in all_members]
        custom_shares = []

    # Calculate authoritative split shares
    calculated_splits = expense_calculator.calculate_splits(
        total_amount=expense_in.amount,
        split_type=expense_in.split_type,
        paid_by_user_id=expense_in.paid_by_user_id,
        member_ids=member_ids,
        custom_shares=custom_shares
    )

    expense = Expense(
        trip_id=expense_in.trip_id,
        paid_by_user_id=expense_in.paid_by_user_id,
        amount=expense_in.amount,
        currency=expense_in.currency,
        category=expense_in.category.upper(),
        description=expense_in.description,
        expense_date=expense_in.expense_date,
        split_type=expense_in.split_type,
        receipt_url=expense_in.receipt_url,
        notes=expense_in.notes
    )
    db.add(expense)
    db.flush()

    for item in calculated_splits:
        part = ExpenseParticipant(
            expense_id=expense.id,
            user_id=item["user_id"],
            share_amount=item["share_amount"],
            share_percentage=item.get("share_percentage")
        )
        db.add(part)

    db.commit()
    db.refresh(expense)

    # Notify trip members of new expense
    notification_service.notify_trip_members(
        db=db,
        trip_id=expense.trip_id,
        exclude_user_id=current_user.id,
        type=NotificationType.EXPENSE_ACTIVITY.value,
        title="New Expense Added",
        message=f"{current_user.full_name} added an expense: '{expense.description}' ({expense.currency} {expense.amount:,.2f}).",
        link_url=f"/trips/{expense.trip_id}?tab=expenses",
        extra_data={"trip_id": expense.trip_id, "expense_id": expense.id}
    )

    return expense

@router.put("/{expense_id}", response_model=ExpenseOut)
def update_expense(
    expense_id: str,
    expense_in: ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value, TripRole.EXPENSE_MANAGER.value])(
        trip_id=expense.trip_id, db=db, current_user=current_user
    )

    if expense_in.amount is not None:
        expense.amount = expense_in.amount
    if expense_in.currency is not None:
        expense.currency = expense_in.currency
    if expense_in.category is not None:
        expense.category = expense_in.category.upper()
    if expense_in.description is not None:
        expense.description = expense_in.description
    if expense_in.expense_date is not None:
        expense.expense_date = expense_in.expense_date
    if expense_in.split_type is not None:
        expense.split_type = expense_in.split_type
    if expense_in.paid_by_user_id is not None:
        expense.paid_by_user_id = expense_in.paid_by_user_id
    if expense_in.receipt_url is not None:
        expense.receipt_url = expense_in.receipt_url
    if expense_in.notes is not None:
        expense.notes = expense_in.notes

    # Re-calculate participants if requested or if amount changed
    if expense_in.participants is not None:
        db.query(ExpenseParticipant).filter(ExpenseParticipant.expense_id == expense.id).delete()
        member_ids = [p.user_id for p in expense_in.participants]
        custom_shares = [p.dict() for p in expense_in.participants]
        calculated_splits = expense_calculator.calculate_splits(
            total_amount=expense.amount,
            split_type=expense.split_type,
            paid_by_user_id=expense.paid_by_user_id,
            member_ids=member_ids,
            custom_shares=custom_shares
        )
        for item in calculated_splits:
            part = ExpenseParticipant(
                expense_id=expense.id,
                user_id=item["user_id"],
                share_amount=item["share_amount"],
                share_percentage=item.get("share_percentage")
            )
            db.add(part)

    db.commit()
    db.refresh(expense)
    return expense

@router.delete("/{expense_id}")
def delete_expense(
    expense_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    expense = db.query(Expense).filter(Expense.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code=404, detail="Expense not found")

    require_trip_roles([TripRole.OWNER.value, TripRole.EDITOR.value, TripRole.EXPENSE_MANAGER.value])(
        trip_id=expense.trip_id, db=db, current_user=current_user
    )

    db.delete(expense)
    db.commit()
    return {"message": "Expense deleted"}

@router.post("/settle", response_model=SettlementOut, status_code=status.HTTP_201_CREATED)
def record_settlement(
    settle_in: SettlementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    check_trip_member(trip_id=settle_in.trip_id, db=db, current_user=current_user)

    receiver = db.query(User).filter(User.id == settle_in.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver user not found")

    settlement = Settlement(
        trip_id=settle_in.trip_id,
        payer_id=current_user.id,
        receiver_id=settle_in.receiver_id,
        amount=settle_in.amount,
        currency=settle_in.currency,
        is_settled=True,
        settled_at=datetime.now(timezone.utc),
        notes=settle_in.notes or f"Settlement payment recorded by {current_user.full_name}."
    )
    db.add(settlement)
    db.commit()
    db.refresh(settlement)

    notification_service.create_notification(
        db=db,
        user_id=receiver.id,
        type=NotificationType.EXPENSE_ACTIVITY.value,
        title="Settlement Payment Received",
        message=f"{current_user.full_name} recorded a settlement payment of {settlement.currency} {settlement.amount:,.2f} to you.",
        link_url=f"/trips/{settle_in.trip_id}?tab=expenses",
        extra_data={"trip_id": settle_in.trip_id, "settlement_id": settlement.id}
    )

    return settlement

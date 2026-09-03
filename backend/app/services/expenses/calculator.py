from decimal import Decimal, ROUND_HALF_UP
from typing import List, Dict, Tuple, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.models.expense import Expense, ExpenseParticipant, Settlement, SplitType
from backend.app.models.trip import Trip, TripMember
from backend.app.models.user import User
from backend.app.schemas.expense import (
    SuggestedSettlement, MemberBalance, CategorySpending, DailySpending, ExpenseAnalyticsSummary, ExpenseOut
)

class ExpenseCalculator:
    @staticmethod
    def calculate_splits(
        total_amount: Decimal,
        split_type: str,
        paid_by_user_id: str,
        member_ids: List[str],
        custom_shares: Optional[List[Dict[str, Any]]] = None
    ) -> List[Dict[str, Any]]:
        """
        Calculates individual share amounts based on split type.
        Returns list of dicts: {"user_id": ..., "share_amount": Decimal, "share_percentage": float}
        """
        if not member_ids:
            return []

        results = []
        if split_type == SplitType.EQUAL.value:
            count = len(member_ids)
            base_share = (total_amount / Decimal(count)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            
            # Adjust rounding difference on the last participant
            calculated_total = base_share * Decimal(count)
            diff = total_amount - calculated_total
            
            for idx, m_id in enumerate(member_ids):
                share = base_share + (diff if idx == count - 1 else Decimal("0.00"))
                pct = round(100.0 / count, 2)
                results.append({
                    "user_id": m_id,
                    "share_amount": share,
                    "share_percentage": pct
                })
        elif split_type == SplitType.PERCENTAGE.value and custom_shares:
            for item in custom_shares:
                u_id = item["user_id"]
                pct = float(item.get("share_percentage", 0.0))
                share = (total_amount * (Decimal(str(pct)) / Decimal("100.0"))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                results.append({
                    "user_id": u_id,
                    "share_amount": share,
                    "share_percentage": pct
                })
        elif split_type == SplitType.EXACT.value and custom_shares:
            for item in custom_shares:
                u_id = item["user_id"]
                amt = Decimal(str(item.get("share_amount", 0.0))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                pct = float(round((amt / total_amount * 100), 2)) if total_amount > 0 else 0.0
                results.append({
                    "user_id": u_id,
                    "share_amount": amt,
                    "share_percentage": pct
                })
        else:
            # Fallback equal
            return ExpenseCalculator.calculate_splits(total_amount, SplitType.EQUAL.value, paid_by_user_id, member_ids)

        return results

    @staticmethod
    def calculate_trip_analytics(db: Session, trip_id: str) -> ExpenseAnalyticsSummary:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise ValueError("Trip not found")

        members = db.query(TripMember).filter(TripMember.trip_id == trip_id).all()
        user_ids = [m.user_id for m in members]
        users = {u.id: u for u in db.query(User).filter(User.id.in_(user_ids)).all()} if user_ids else {}

        expenses = db.query(Expense).filter(Expense.trip_id == trip_id).order_by(Expense.expense_date.desc()).all()
        settlements = db.query(Settlement).filter(Settlement.trip_id == trip_id, Settlement.is_settled == True).all()

        total_spent = sum([e.amount for e in expenses], Decimal("0.00"))
        remaining_budget = max(Decimal("0.00"), trip.budget - total_spent)
        budget_pct = float(round((total_spent / trip.budget * 100), 1)) if trip.budget > 0 else 0.0

        # Category spending
        category_totals: Dict[str, Decimal] = {}
        for e in expenses:
            category_totals[e.category] = category_totals.get(e.category, Decimal("0.00")) + e.amount

        category_spending_list = []
        for cat, amt in category_totals.items():
            pct = float(round((amt / total_spent * 100), 1)) if total_spent > 0 else 0.0
            category_spending_list.append(CategorySpending(
                category=cat,
                amount=amt,
                percentage=pct
            ))

        # Daily spending
        daily_totals: Dict[str, Decimal] = {}
        for e in sorted(expenses, key=lambda x: x.expense_date):
            date_str = e.expense_date.strftime("%Y-%m-%d")
            daily_totals[date_str] = daily_totals.get(date_str, Decimal("0.00")) + e.amount

        daily_spending_list = [
            DailySpending(date=d, amount=a) for d, a in daily_totals.items()
        ]

        # Member balances (Net = Paid - Share + Settled_Paid - Settled_Received)
        paid_map: Dict[str, Decimal] = {u_id: Decimal("0.00") for u_id in user_ids}
        share_map: Dict[str, Decimal] = {u_id: Decimal("0.00") for u_id in user_ids}

        for e in expenses:
            paid_map[e.paid_by_user_id] = paid_map.get(e.paid_by_user_id, Decimal("0.00")) + e.amount
            for part in e.participants:
                share_map[part.user_id] = share_map.get(part.user_id, Decimal("0.00")) + part.share_amount

        # Account for settled repayments
        for s in settlements:
            paid_map[s.payer_id] = paid_map.get(s.payer_id, Decimal("0.00")) + s.amount
            paid_map[s.receiver_id] = paid_map.get(s.receiver_id, Decimal("0.00")) - s.amount

        member_balances: List[MemberBalance] = []
        net_balances: Dict[str, Decimal] = {}
        for u_id in user_ids:
            u = users.get(u_id)
            name = u.full_name if u else "Traveler"
            avatar = u.avatar_url if u else None
            p = paid_map.get(u_id, Decimal("0.00"))
            s = share_map.get(u_id, Decimal("0.00"))
            net = p - s
            net_balances[u_id] = net
            member_balances.append(MemberBalance(
                user_id=u_id,
                user_name=name,
                avatar_url=avatar,
                total_paid=p,
                total_share=s,
                net_balance=net
            ))

        # Simplify Debt Algorithm (Greedy Minimum Cash Flow settlement calculation)
        suggested_settlements = ExpenseCalculator._simplify_debts(net_balances, users, trip.currency)

        recent_expenses = [ExpenseOut.model_validate(e) for e in expenses[:10]]

        return ExpenseAnalyticsSummary(
            trip_id=trip_id,
            total_spent=total_spent,
            trip_budget=trip.budget,
            remaining_budget=remaining_budget,
            budget_usage_percentage=budget_pct,
            currency=trip.currency,
            spending_by_category=category_spending_list,
            spending_by_member=member_balances,
            daily_spending=daily_spending_list,
            suggested_settlements=suggested_settlements,
            recent_expenses=recent_expenses
        )

    @staticmethod
    def _simplify_debts(net_balances: Dict[str, Decimal], users: Dict[str, User], currency: str) -> List[SuggestedSettlement]:
        """
        Greedy minimum cash flow debt settlement optimizer:
        Matches the biggest debtor with the biggest creditor until all debts are settled.
        """
        debtors: List[Tuple[str, Decimal]] = []   # net < 0 (owes money)
        creditors: List[Tuple[str, Decimal]] = [] # net > 0 (owed money)

        for u_id, net in net_balances.items():
            if net < Decimal("-0.01"):
                debtors.append((u_id, -net))
            elif net > Decimal("0.01"):
                creditors.append((u_id, net))

        debtors.sort(key=lambda x: x[1], reverse=True)
        creditors.sort(key=lambda x: x[1], reverse=True)

        settlements: List[SuggestedSettlement] = []
        i, j = 0, 0
        while i < len(debtors) and j < len(creditors):
            debtor_id, debit = debtors[i]
            creditor_id, credit = creditors[j]

            settled_amount = min(debit, credit).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            
            d_user = users.get(debtor_id)
            c_user = users.get(creditor_id)

            settlements.append(SuggestedSettlement(
                payer_id=debtor_id,
                payer_name=d_user.full_name if d_user else "Traveler",
                payer_avatar=d_user.avatar_url if d_user else None,
                receiver_id=creditor_id,
                receiver_name=c_user.full_name if c_user else "Traveler",
                receiver_avatar=c_user.avatar_url if c_user else None,
                amount=settled_amount,
                currency=currency
            ))

            debit -= settled_amount
            credit -= settled_amount

            if debit <= Decimal("0.01"):
                i += 1
            else:
                debtors[i] = (debtor_id, debit)

            if credit <= Decimal("0.01"):
                j += 1
            else:
                creditors[j] = (creditor_id, credit)

        return settlements

expense_calculator = ExpenseCalculator()

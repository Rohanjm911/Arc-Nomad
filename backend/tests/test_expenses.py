from decimal import Decimal
from backend.app.services.expenses.calculator import expense_calculator

def test_equal_split_math():
    splits = expense_calculator.calculate_splits(
        total_amount=Decimal("100.00"),
        split_type="EQUAL",
        paid_by_user_id="user1",
        member_ids=["user1", "user2", "user3"]
    )
    assert len(splits) == 3
    total_split = sum([s["share_amount"] for s in splits])
    assert total_split == Decimal("100.00")

def test_percentage_split_math():
    shares = [
        {"user_id": "u1", "share_percentage": 50.0},
        {"user_id": "u2", "share_percentage": 30.0},
        {"user_id": "u3", "share_percentage": 20.0},
    ]
    splits = expense_calculator.calculate_splits(
        total_amount=Decimal("200.00"),
        split_type="PERCENTAGE",
        paid_by_user_id="u1",
        member_ids=["u1", "u2", "u3"],
        custom_shares=shares
    )
    assert splits[0]["share_amount"] == Decimal("100.00")
    assert splits[1]["share_amount"] == Decimal("60.00")
    assert splits[2]["share_amount"] == Decimal("40.00")

def test_debt_simplification():
    # User 1 paid $90 for User 1, 2, 3 ($30 each)
    # Net balances: u1 = +60, u2 = -30, u3 = -30
    from backend.app.models.user import User
    users = {
        "u1": User(id="u1", full_name="Alice", email="alice@test.com", username="alice"),
        "u2": User(id="u2", full_name="Bob", email="bob@test.com", username="bob"),
        "u3": User(id="u3", full_name="Charlie", email="charlie@test.com", username="charlie")
    }
    net_balances = {
        "u1": Decimal("60.00"),
        "u2": Decimal("-30.00"),
        "u3": Decimal("-30.00")
    }
    settlements = expense_calculator._simplify_debts(net_balances, users, "USD")
    assert len(settlements) == 2
    total_settled = sum([s.amount for s in settlements])
    assert total_settled == Decimal("60.00")

from datetime import datetime, timedelta, timezone
from decimal import Decimal

def test_exports(client, auth_headers):
    # Create trip first
    start = (datetime.now(timezone.utc) + timedelta(days=10)).isoformat()
    end = (datetime.now(timezone.utc) + timedelta(days=14)).isoformat()

    trip_payload = {
        "title": "Export Test Voyage",
        "description": "Testing PDF and Excel generation",
        "destination": "Paris, France",
        "start_date": start,
        "end_date": end,
        "budget": 2000.0,
        "currency": "EUR"
    }

    res = client.post("/api/v1/trips/", json=trip_payload, headers=auth_headers)
    trip_id = res.json()["id"]

    # Test PDF Export
    pdf_res = client.get(f"/api/v1/exports/{trip_id}/pdf", headers=auth_headers)
    assert pdf_res.status_code == 200
    assert pdf_res.headers["content-type"] == "application/pdf"
    assert len(pdf_res.content) > 1000

    # Test Excel Export
    excel_res = client.get(f"/api/v1/exports/{trip_id}/excel", headers=auth_headers)
    assert excel_res.status_code == 200
    assert "spreadsheetml.sheet" in excel_res.headers["content-type"]
    assert len(excel_res.content) > 1000

    import io
    import openpyxl
    wb = openpyxl.load_workbook(io.BytesIO(excel_res.content))
    expected_sheets = [
        "Trip Overview",
        "Itinerary Schedule",
        "Flights & Logistics",
        "Expense Ledger",
        "Balances & Settlements",
        "Category Breakdown"
    ]
    for s in expected_sheets:
        assert s in wb.sheetnames
    # Verify Column A is not stretched out of proportion
    assert wb["Trip Overview"].column_dimensions["A"].width <= 42
    assert wb["Itinerary Schedule"].column_dimensions["A"].width <= 25


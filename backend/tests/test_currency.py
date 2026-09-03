import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.expenses.currency_service import currency_service, CURRENCY_CATALOG

client = TestClient(app)

def test_currency_catalog_has_over_40_currencies():
    assert len(CURRENCY_CATALOG) >= 40
    codes = [c["code"] for c in CURRENCY_CATALOG]
    for major in ["USD", "EUR", "GBP", "JPY", "INR", "CAD", "AUD", "SGD", "AED", "THB", "KRW", "BRL"]:
        assert major in codes

@pytest.mark.asyncio
async def test_currency_service_exchange_rates():
    rates_data = await currency_service.get_exchange_rates("USD")
    assert rates_data["base"] == "USD"
    assert "EUR" in rates_data["rates"]
    assert "JPY" in rates_data["rates"]
    assert "INR" in rates_data["rates"]
    assert rates_data["rates"]["USD"] == 1.0

def test_currency_service_convert():
    res = currency_service.convert(100, "USD", "USD")
    assert res["converted_amount"] == 100
    assert res["rate"] == 1.0

    res_jpy = currency_service.convert(100, "USD", "JPY")
    assert res_jpy["converted_amount"] > 1000

def test_api_exchange_rates_endpoint():
    response = client.get("/api/v1/expenses/exchange-rates/latest?base=EUR")
    assert response.status_code == 200
    data = response.json()
    assert data["base"] == "EUR"
    assert "USD" in data["rates"]
    assert len(data["currencies"]) >= 40
